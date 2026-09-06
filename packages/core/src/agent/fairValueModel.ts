export interface PriceCandle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface MarketEstimateContext {
  marketSymbol: string;
  midPrice?: number;
  candles?: PriceCandle[];
  spotPrice?: number;
  strikePrice?: number;
  expiryTimestampSec: number;
  nowTimestampSec?: number;
}

export interface FairValueModel {
  name: string;
  estimate(ctx: MarketEstimateContext): number; // Returns P(Up) in (0, 1)
}

/**
 * Baseline v1 Model: Follows the CLOB mid-price, or defaults to 0.5 if no order book.
 */
export class MidFollowingModel implements FairValueModel {
  public readonly name = "MidFollowingModel";

  estimate(ctx: MarketEstimateContext): number {
    if (ctx.midPrice !== undefined && ctx.midPrice > 0.01 && ctx.midPrice < 0.99) {
      return ctx.midPrice;
    }
    return 0.5;
  }
}

/**
 * Standard Normal Cumulative Distribution Function (Abramowitz & Stegun 7.1.26 polynomial approximation).
 * Precision: |error| < 1.5e-7
 */
export function normalCDF(x: number): number {
  if (x > 6.0) return 1.0;
  if (x < -6.0) return 0.0;

  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const p = 0.2316419;
  const c = 0.3989422804014327; // 1 / sqrt(2 * pi)

  const z = Math.abs(x);
  const t = 1.0 / (1.0 + p * z);
  const pdf = c * Math.exp(-0.5 * z * z);
  const poly = ((((b5 * t + b4) * t + b3) * t + b2) * t + b1) * t;
  const cdf = 1.0 - pdf * poly;

  return x >= 0 ? cdf : 1.0 - cdf;
}

/**
 * Estimates rolling annualized volatility from short-window candles using EWMA.
 */
export function calculateEWMAVolatility(
  candles: PriceCandle[],
  decay = 0.94,
  annualizationFactor = Math.sqrt(365.25 * 24 * 60 * 4) // 15-minute periods in a year
): number {
  if (!candles || candles.length < 2) {
    return 0.45; // Default 45% baseline crypto annualized volatility
  }

  // Calculate log returns
  const returns: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const prev = candles[i - 1].close;
    const curr = candles[i].close;
    if (prev > 0 && curr > 0) {
      returns.push(Math.log(curr / prev));
    }
  }

  if (returns.length === 0) {
    return 0.45;
  }

  // Compute EWMA variance
  let variance = returns[0] * returns[0];
  for (let i = 1; i < returns.length; i++) {
    variance = decay * variance + (1 - decay) * returns[i] * returns[i];
  }

  const periodVol = Math.sqrt(variance);
  const annualizedVol = periodVol * annualizationFactor;

  // Clamp between 10% and 250% annualized vol
  return Math.max(0.1, Math.min(2.5, annualizedVol));
}

/**
 * Quantitative Model: Closed-Form Black-Scholes Cash-or-Nothing Digital Call Delta.
 * P(Up) = N(d2)
 * d2 = [ ln(S / K) + (r - 0.5 * sigma^2) * tau ] / (sigma * sqrt(tau))
 */
export class BlackScholesBinaryModel implements FairValueModel {
  public readonly name = "BlackScholesBinaryModel";
  private readonly riskFreeRate: number;

  constructor(riskFreeRate = 0.03) {
    this.riskFreeRate = riskFreeRate;
  }

  estimate(ctx: MarketEstimateContext): number {
    const nowSec = ctx.nowTimestampSec ?? Math.floor(Date.now() / 1000);
    const secondsRemaining = Math.max(1, ctx.expiryTimestampSec - nowSec);

    // Tau in annualized years (365.25 days * 86400 seconds)
    const tau = secondsRemaining / (365.25 * 86400);

    // Determine Spot S and Strike K
    let S = ctx.spotPrice;
    let K = ctx.strikePrice;

    if (ctx.candles && ctx.candles.length > 0) {
      if (!S) S = ctx.candles[ctx.candles.length - 1].close;
      if (!K) K = ctx.candles[0].open; // First candle opening in window serves as strike K
    }

    // Fallback if price feeds unavailable: use mid-price or 0.5
    if (!S || !K || S <= 0 || K <= 0) {
      if (ctx.midPrice !== undefined && ctx.midPrice > 0.05 && ctx.midPrice < 0.95) {
        return ctx.midPrice;
      }
      return 0.5;
    }

    // Calculate rolling EWMA volatility from scoped candles
    const sigma = ctx.candles ? calculateEWMAVolatility(ctx.candles) : 0.45;

    const sqrtTau = Math.sqrt(tau);
    const logMoneyness = Math.log(S / K);
    const drift = (this.riskFreeRate - 0.5 * sigma * sigma) * tau;

    const d2 = (logMoneyness + drift) / (sigma * sqrtTau);

    const probUp = normalCDF(d2);

    // Bound probability away from exact 0 and 1 to protect against extreme order-book pricing
    return Math.max(0.02, Math.min(0.98, Number(probUp.toFixed(4))));
  }
}

