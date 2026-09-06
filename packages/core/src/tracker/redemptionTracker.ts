import { getOracleAuditUrl } from "../oracle";

export interface ClaimablePositionView {
  marketId: string;
  marketAddress: `0x${string}`;
  asset: string;
  intervalSec?: number;
  expiry: number;
  outcomeIndex: number;
  outcomeSymbol: string;
  balanceRaw: string;
  claimableAmount: number;
  claimableAmountRaw: string;
  outcomeLabel: string;
  isVoided: boolean;
  oracleQuestionId?: string;
  oracleAuditUrl?: string;
}

export interface ClaimTrackerResult {
  account: `0x${string}`;
  scannedMarketsCount: number;
  claimablePositions: ClaimablePositionView[];
  totalClaimableAmount: number;
  scannedAt: number;
}

/**
 * Discovers and computes all claimable positions for a given account across finalized markets.
 * Note: Must use listBinaryMarkets({ status: "Finalized" }), NOT loadMarkets() because
 * DreamDEX loadMarkets() intentionally skips settled/finalized markets.
 */
export async function findClaimablePositions(
  exchange: any,
  account: `0x${string}`,
  limit = 200
): Promise<ClaimTrackerResult> {
  if (!account || !account.startsWith("0x")) {
    return {
      account: "0x0000000000000000000000000000000000000000",
      scannedMarketsCount: 0,
      claimablePositions: [],
      totalClaimableAmount: 0,
      scannedAt: Date.now(),
    };
  }

  // 1. Fetch finalized binary markets directly from the binary market tier
  const markets = await exchange.client.listBinaryMarkets({
    status: "Finalized",
    limit,
  });

  const claimablePositions: ClaimablePositionView[] = [];
  let totalClaimableAmount = 0;

  for (const market of markets) {
    try {
      const marketAddress = (market.marketAddress || market.address) as `0x${string}`;
      const marketId = market.id || market.marketId;

      if (!marketAddress || !marketId) continue;

      // 2. Fetch user's outcome balances for this market
      const balances = await exchange.client.getOutcomeBalances(account, marketAddress);
      if (!balances) continue;

      // Skip if user holds zero balances in both outcomes
      const yesBal = BigInt(balances.yes || balances[0] || "0");
      const noBal = BigInt(balances.no || balances[1] || "0");
      if (yesBal === 0n && noBal === 0n) continue;

      // 3. Fetch settlement fee (reads live from protocol fees)
      let settlementFeeBps = 0;
      try {
        const fees = await exchange.client.getMarketFees(marketId);
        settlementFeeBps = fees?.settlementFeeBps ?? 0;
      } catch {
        settlementFeeBps = 0;
      }

      // 4. Calculate claimable using SDK's claimableFrom if available, or deterministic payout logic
      // Build claimable inputs for non-zero balances
      const heldOutcomes = [
        { index: 0, symbol: market.outcomes?.[0]?.symbol || "UP", balance: yesBal },
        { index: 1, symbol: market.outcomes?.[1]?.symbol || "DOWN", balance: noBal },
      ].filter((o) => o.balance > 0n);

      for (const held of heldOutcomes) {
        let claimableRaw = 0n;
        let outcomeLabel = "Unresolved";
        const isVoided = Boolean(market.voided || market.status === "Voided");

        if (typeof exchange.claimableFrom === "function") {
          const claimRes = exchange.claimableFrom(market, {
            outcomeIndex: held.index,
            balance: held.balance.toString(),
            settlementFeeBps,
          });
          claimableRaw = BigInt(claimRes?.amount || "0");
          outcomeLabel = isVoided ? "Voided — 50% refund" : "Resolved — you won";
        } else {
          // Fallback payout resolution logic:
          // In binary event contracts: winning outcome gets 100% of payout (1:1 collateral minus fee),
          // voided market returns 50% to both sides.
          const winningOutcome = market.winningOutcome ?? market.resolvedOutcome;
          if (isVoided) {
            claimableRaw = (held.balance * 5000n) / 10000n; // 50%
            outcomeLabel = "Voided — 50% refund";
          } else if (winningOutcome === held.index) {
            const feeDeduction = (held.balance * BigInt(settlementFeeBps)) / 10000n;
            claimableRaw = held.balance - feeDeduction;
            outcomeLabel = "Resolved — you won";
          }
        }

        if (claimableRaw > 0n) {
          // Convert to decimal (collateral is tUSDC: 6 decimals on testnet)
          const decimals = market.collateralDecimals ?? 6;
          const claimableDecimal = Number(claimableRaw) / 10 ** decimals;

          claimablePositions.push({
            marketId,
            marketAddress,
            asset: market.asset || market.symbol || "BTC",
            intervalSec: market.intervalSec,
            expiry: market.expiry || 0,
            outcomeIndex: held.index,
            outcomeSymbol: held.symbol,
            balanceRaw: held.balance.toString(),
            claimableAmount: Number(claimableDecimal.toFixed(4)),
            claimableAmountRaw: claimableRaw.toString(),
            outcomeLabel,
            isVoided,
            oracleQuestionId: market.oracleQuestionId,
            oracleAuditUrl: getOracleAuditUrl(market.oracleQuestionId),
          });

          totalClaimableAmount += claimableDecimal;
        }
      }
    } catch (err) {
      // Gracefully continue to next market on individual failure
      console.warn(`[Pulse ClaimTracker] Error scanning market ${market.id}:`, err);
    }
  }

  return {
    account,
    scannedMarketsCount: markets.length,
    claimablePositions,
    totalClaimableAmount: Number(totalClaimableAmount.toFixed(4)),
    scannedAt: Date.now(),
  };
}
