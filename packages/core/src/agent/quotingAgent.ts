import { unwrapReceipt } from "../client";
import { FairValueModel, MidFollowingModel, BlackScholesBinaryModel, PriceCandle, calculateEWMAVolatility } from "./fairValueModel";
import { PredictionRecord, computeBrierScore, computeDynamicSpreadMultiplier } from "../analytics/calibration";
import { recordDecisionOnChain, OnChainAuditInput } from "./audit";

export interface QuotingAgentConfig {
  halfSpread: number;
  sizePerSide: number;
  minSecondsLeft: number;
  privateKey?: `0x${string}`;
  rpcUrl?: string;
  auditContractAddress?: `0x${string}`;
  useBlackScholes?: boolean;
}

export interface QuotingOrderResult {
  symbol: string;
  side: "buy";
  outcome: "UP" | "DOWN";
  price: number;
  size: number;
  orderId?: string;
  txHash?: string;
  isReverted: boolean;
  wouldCross: boolean;
  error?: string;
}

export interface ActiveMarketView {
  marketId: string;
  symbol: string;
  expiry: number;
  secondsLeft: number;
  fairUp: number;
  volatility: number;
  strikePrice?: number;
  spotPrice?: number;
  bidUpPrice: number;
  bidDownPrice: number;
  status: number;
}

export interface QuotingPassSummary {
  timestamp: number;
  marketsScanned: number;
  marketsQuoted: number;
  ordersPlaced: QuotingOrderResult[];
  predictionsRecorded: PredictionRecord[];
  auditTxHashes: string[];
  activeModel: string;
  brierScore: number;
  effectiveSpread: number;
  activeMarket?: ActiveMarketView;
}

export interface MarketInventoryState {
  marketId: string;
  upFilled: boolean;
  downFilled: boolean;
  lastQuoteTimestamp: number;
}

export class PulseQuotingAgent {
  private exchange: any;
  private config: QuotingAgentConfig;
  private model: FairValueModel;
  private inventoryStates = new Map<string, MarketInventoryState>();
  private predictionsHistory: PredictionRecord[] = [];
  private totalQuotesCount = 0;

  constructor(exchange: any, config: Partial<QuotingAgentConfig> = {}) {
    this.exchange = exchange;
    this.config = {
      halfSpread: config.halfSpread ?? 0.02,
      sizePerSide: config.sizePerSide ?? 5,
      minSecondsLeft: config.minSecondsLeft ?? 300, // Skip if < 5 mins to expiry
      privateKey: config.privateKey,
      rpcUrl: config.rpcUrl,
      auditContractAddress: config.auditContractAddress,
      useBlackScholes: config.useBlackScholes ?? true,
    };

    this.model = this.config.useBlackScholes
      ? new BlackScholesBinaryModel()
      : new MidFollowingModel();
  }

  public getPredictionHistory(): PredictionRecord[] {
    return [...this.predictionsHistory];
  }

  public getTotalQuotesCount(): number {
    return this.totalQuotesCount;
  }

  public getActiveModelName(): string {
    return this.model.name;
  }

  /**
   * Updates resolution for past quoted markets to feed the Brier scoring engine
   */
  public async updateSettledOutcomes(): Promise<void> {
    const unresolved = this.predictionsHistory.filter((p) => p.actualOutcome === undefined);
    if (unresolved.length === 0) return;

    for (const pred of unresolved) {
      try {
        const resolution = await this.exchange.client.getMarketResolution(pred.marketId);
        if (resolution && resolution.status === 3) {
          // Finalized
          pred.resolvedAt = Date.now();
          if (resolution.voided) {
            pred.actualOutcome = 0.5;
          } else {
            pred.actualOutcome = resolution.winningOutcome === 0 ? 1 : 0;
          }
        }
      } catch {
        // Continue if market not yet resolved
      }
    }
  }

  /**
   * Executes a single automated market-making pass over active DreamDEX Event Contracts
   */
  public async runQuotingPass(): Promise<QuotingPassSummary> {
    const nowSec = Math.floor(Date.now() / 1000);
    const summary: QuotingPassSummary = {
      timestamp: Date.now(),
      marketsScanned: 0,
      marketsQuoted: 0,
      ordersPlaced: [],
      predictionsRecorded: [],
      auditTxHashes: [],
      activeModel: this.model.name,
      brierScore: computeBrierScore(this.predictionsHistory),
      effectiveSpread: this.config.halfSpread * 2,
    };

    // Dynamically adjust spread based on calibration health
    const spreadMultiplier = computeDynamicSpreadMultiplier(summary.brierScore);
    const currentHalfSpread = Number((this.config.halfSpread * spreadMultiplier).toFixed(4));
    summary.effectiveSpread = currentHalfSpread * 2;

    try {
      // 1. Load active markets
      await this.exchange.loadMarkets(true);
      const allMarkets = Object.values(this.exchange.markets || {}) as any[];

      // Filter binary markets
      const activeBinaryMarkets = allMarkets.filter((m: any) => {
        const isBinary = m.info?.marketType === "binary" || m.outcomes?.length === 2;
        return m.active && isBinary;
      });

      summary.marketsScanned = activeBinaryMarkets.length;

      // Filter to current candidate windows (not yet expired, within 24h, and not inside lock window)
      const candidateMarkets = activeBinaryMarkets
        .filter((m: any) => {
          const exp = Number(m.info?.expiry || m.expiry || 0);
          const secondsLeft = exp - nowSec;
          return secondsLeft >= this.config.minSecondsLeft && secondsLeft <= 86400;
        })
        .slice(0, 3); // Focus quoting on top active markets (BTC/ETH)

      for (const market of candidateMarkets) {
        try {
          const expiry = Number(market.info?.expiry || market.expiry || 0);
          const secondsLeft = expiry - nowSec;

          // Rule 2: Gotcha #1 — Re-confirm live on-chain status (indexer lags)
          const marketId = market.id || market.info?.marketId;
          const onchain = await this.exchange.client.getMarketOnchain(marketId);
          if (!onchain || onchain.status !== 1) {
            // Not in Trading status
            continue;
          }

          const upOutcome = market.outcomes?.[0];
          const downOutcome = market.outcomes?.[1];
          if (!upOutcome?.symbol || !downOutcome?.symbol) continue;

          // Rule 3: Fetch order book to compute mid price
          let midPrice: number | undefined;
          try {
            const orderBook = await this.exchange.fetchOrderBook(upOutcome.symbol, 5);
            const bestBid = orderBook?.bids?.[0]?.[0];
            const bestAsk = orderBook?.asks?.[0]?.[0];
            if (bestBid !== undefined && bestAsk !== undefined) {
              midPrice = (bestBid + bestAsk) / 2;
            }
          } catch {
            // Book might be empty at window inception
          }

          // Rule 4: Fetch candles scoped to [tradingStart, expiry] to avoid recycled pool data contamination
          let candles: PriceCandle[] = [];
          try {
            const tradingStart = market.info?.tradingStart || market.tradingStart || (expiry - 900);
            if (this.exchange.fetchPriceCandles) {
              const rawCandles = await this.exchange.fetchPriceCandles(market.symbol, "1m", tradingStart, 30);
              candles = (rawCandles || []).map((c: any) => ({
                timestamp: c.timestamp || c[0],
                open: c.open || c[1],
                high: c.high || c[2],
                low: c.low || c[3],
                close: c.close || c[4],
                volume: c.volume || c[5],
              }));
            }
          } catch {
            // Fallback if candle endpoint unavailable
          }

          // Rule 5: Calculate Fair Value P(Up)
          const fairUp = this.model.estimate({
            marketSymbol: market.symbol,
            midPrice,
            candles,
            expiryTimestampSec: expiry,
            nowTimestampSec: nowSec,
          });

          // Rule 6: Apply Avellaneda-Stoikov inventory skewing
          const invState = this.inventoryStates.get(marketId) || {
            marketId,
            upFilled: false,
            downFilled: false,
            lastQuoteTimestamp: Date.now(),
          };

          let upSpread = currentHalfSpread;
          let downSpread = currentHalfSpread;

          // If UP filled without DOWN, skew DOWN bid higher to attract takers and complete pair
          if (invState.upFilled && !invState.downFilled) {
            downSpread = Math.max(0.005, currentHalfSpread * 0.5); // Tighter/higher DOWN bid
            upSpread = currentHalfSpread * 1.5;                     // Lower UP bid to stop accumulating
          } else if (invState.downFilled && !invState.upFilled) {
            upSpread = Math.max(0.005, currentHalfSpread * 0.5);   // Tighter/higher UP bid
            downSpread = currentHalfSpread * 1.5;
          }

          const bidUpPrice = Number(Math.max(0.01, Math.min(0.99, fairUp - upSpread)).toFixed(3));
          const bidDownPrice = Number(Math.max(0.01, Math.min(0.99, (1 - fairUp) - downSpread)).toFixed(3));

          if (!summary.activeMarket) {
            summary.activeMarket = {
              marketId,
              symbol: market.symbol || "BTC-15M-UPDOWN",
              expiry,
              secondsLeft,
              fairUp,
              volatility: candles.length > 0 ? calculateEWMAVolatility(candles) : 0.441,
              strikePrice: candles.length > 0 ? candles[0].open : undefined,
              spotPrice: candles.length > 0 ? candles[candles.length - 1].close : undefined,
              bidUpPrice,
              bidDownPrice,
              status: 1,
            };
          }

          // Rule 7: Post Dual postOnly limit buy orders (zero starting inventory pair minting)
          const quoteOrders = [
            { symbol: upOutcome.symbol, side: "buy" as const, outcome: "UP" as const, price: bidUpPrice },
            { symbol: downOutcome.symbol, side: "buy" as const, outcome: "DOWN" as const, price: bidDownPrice },
          ];

          for (const q of quoteOrders) {
            try {
              const res = await this.exchange.createOrder(
                q.symbol,
                "limit",
                q.side,
                this.config.sizePerSide,
                q.price,
                { postOnly: true }
              );

              // Rule 8: Gotcha #3 — unwrap nested receipt
              const { receipt, isReverted, transactionHash } = unwrapReceipt(res);

              summary.ordersPlaced.push({
                symbol: q.symbol,
                side: q.side,
                outcome: q.outcome,
                price: q.price,
                size: this.config.sizePerSide,
                orderId: res.id,
                txHash: transactionHash,
                isReverted,
                wouldCross: false,
              });

              this.totalQuotesCount++;
            } catch (orderErr: any) {
              const errMsg = orderErr?.message || String(orderErr);
              const wouldCross = errMsg.includes("PostOnlyWouldCross") || errMsg.includes("would cross");

              summary.ordersPlaced.push({
                symbol: q.symbol,
                side: q.side,
                outcome: q.outcome,
                price: q.price,
                size: this.config.sizePerSide,
                isReverted: false,
                wouldCross,
                error: errMsg,
              });
            }
          }

          // Rule 9: Record prediction to calibration store
          const predRecord: PredictionRecord = {
            marketId,
            asset: market.asset || market.symbol || "BTC",
            predictedProbUp: fairUp,
            quotedAt: Date.now(),
          };
          this.predictionsHistory.push(predRecord);
          summary.predictionsRecorded.push(predRecord);
          summary.marketsQuoted++;

          // Rule 10: Dispatch on-chain attestation to PulseAudit.sol if configured
          if (this.config.auditContractAddress && this.config.privateKey && this.config.rpcUrl) {
            const auditInput: OnChainAuditInput = {
              marketId,
              predictedProbUp: fairUp,
              brierScore: summary.brierScore,
              spotPrice: candles.length > 0 ? candles[candles.length - 1].close : undefined,
              strikePrice: candles.length > 0 ? candles[0].open : undefined,
              halfSpread: currentHalfSpread,
              timestamp: nowSec,
            };

            const auditRes = await recordDecisionOnChain(
              this.config.auditContractAddress,
              this.config.privateKey,
              this.config.rpcUrl,
              auditInput
            );

            if (auditRes.txHash) {
              summary.auditTxHashes.push(auditRes.txHash);
            }
          }
        } catch (marketErr) {
          console.warn(`[Pulse QuotingAgent] Failed to quote market ${market.id}:`, marketErr);
        }
      }
    } catch (passErr) {
      console.error("[Pulse QuotingAgent] Quoting pass error:", passErr);
    }

    return summary;
  }
}
