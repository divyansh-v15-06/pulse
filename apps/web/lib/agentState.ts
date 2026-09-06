import { PredictionRecord, getCalibrationStats } from "@pulse/core";

export interface TelemetryState {
  isQuotingActive: boolean;
  activeMarketId?: string;
  activeMarketSymbol?: string;
  activeModel: string;
  effectiveSpread: number;
  totalQuotesPlaced: number;
  lastQuoteTimestamp?: number;
  brierScore: number;
  unhedgedLegsCount: number;
  recentOrders: Array<{
    symbol: string;
    outcome: "UP" | "DOWN";
    price: number;
    size: number;
    timestamp: number;
    txHash?: string;
  }>;
}

// Global singleton across server routes in dev/runtime
declare global {
  var __pulseTelemetry: TelemetryState | undefined;
  var __pulsePredictions: PredictionRecord[] | undefined;
}

if (!global.__pulseTelemetry) {
  global.__pulseTelemetry = {
    isQuotingActive: true,
    activeMarketSymbol: "BTC-15M-UPDOWN",
    activeModel: "BlackScholesBinaryModel",
    effectiveSpread: 0.04,
    totalQuotesPlaced: 0,
    brierScore: 0.114,
    unhedgedLegsCount: 0,
    recentOrders: [],
  };
}

if (!global.__pulsePredictions) {
  // Pre-seed with calibration data points for immediate rich demo visualization
  const now = Date.now();
  global.__pulsePredictions = [
    { marketId: "0xbtc-15m-1", asset: "BTC", predictedProbUp: 0.62, quotedAt: now - 3600000, resolvedAt: now - 2700000, actualOutcome: 1 },
    { marketId: "0xbtc-15m-2", asset: "BTC", predictedProbUp: 0.38, quotedAt: now - 2700000, resolvedAt: now - 1800000, actualOutcome: 0 },
    { marketId: "0xbtc-15m-3", asset: "BTC", predictedProbUp: 0.71, quotedAt: now - 1800000, resolvedAt: now - 900000, actualOutcome: 1 },
    { marketId: "0xbtc-15m-4", asset: "BTC", predictedProbUp: 0.45, quotedAt: now - 900000, resolvedAt: now - 300000, actualOutcome: 0 },
    { marketId: "0xbtc-15m-5", asset: "BTC", predictedProbUp: 0.58, quotedAt: now - 300000, resolvedAt: undefined, actualOutcome: undefined },
  ];
}

export function getTelemetry(): TelemetryState {
  return global.__pulseTelemetry!;
}

export function updateTelemetry(patch: Partial<TelemetryState>): void {
  global.__pulseTelemetry = {
    ...global.__pulseTelemetry!,
    ...patch,
  };
}

export function getPredictions(): PredictionRecord[] {
  return global.__pulsePredictions!;
}

export function recordPrediction(pred: PredictionRecord): void {
  global.__pulsePredictions!.push(pred);
  const stats = getCalibrationStats(global.__pulsePredictions!);
  updateTelemetry({
    brierScore: stats.brierScore,
    totalQuotesPlaced: (global.__pulseTelemetry?.totalQuotesPlaced || 0) + 1,
    lastQuoteTimestamp: Date.now(),
  });
}

