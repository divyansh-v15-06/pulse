export interface PredictionRecord {
  marketId: string;
  asset: string;
  predictedProbUp: number; // in [0, 1]
  quotedAt: number;        // timestamp in ms
  resolvedAt?: number;     // timestamp in ms
  actualOutcome?: number;  // 1 if Up won, 0 if Down won, 0.5 if voided
  txHash?: string;         // On-chain Somnia Shannon attestation hash
}

export interface CalibrationBucket {
  binMin: number;
  binMax: number;
  binMid: number;
  predictedAvg: number;
  empiricalWinRate: number;
  count: number;
}

export interface CalibrationStats {
  totalPredictions: number;
  resolvedPredictions: number;
  brierScore: number;
  unresolvedCount: number;
  reliabilityBuckets: CalibrationBucket[];
  spreadMultiplier: number;
}

/**
 * Calculates the Brier score: (1/N) * sum((predicted - actual)^2).
 * Lower is better. 0.0 = perfect calibration, 0.25 = uninformative 50/50 baseline.
 */
export function computeBrierScore(records: PredictionRecord[]): number {
  const resolved = records.filter(
    (r) => r.actualOutcome !== undefined && (r.actualOutcome === 0 || r.actualOutcome === 1)
  );

  if (resolved.length === 0) {
    return 0.25; // Default uninformative baseline
  }

  const sumSquaredDiff = resolved.reduce((acc, r) => {
    const diff = r.predictedProbUp - (r.actualOutcome as number);
    return acc + diff * diff;
  }, 0);

  return Number((sumSquaredDiff / resolved.length).toFixed(4));
}

/**
 * Bins predictions into deciles [0-0.1, 0.1-0.2, ..., 0.9-1.0] for the Recharts reliability diagram.
 */
export function computeReliabilityBuckets(
  records: PredictionRecord[],
  numBins = 10
): CalibrationBucket[] {
  const resolved = records.filter(
    (r) => r.actualOutcome !== undefined && (r.actualOutcome === 0 || r.actualOutcome === 1)
  );

  const binSize = 1.0 / numBins;
  const buckets: CalibrationBucket[] = [];

  for (let i = 0; i < numBins; i++) {
    const binMin = i * binSize;
    const binMax = (i + 1) * binSize;
    const binMid = (binMin + binMax) / 2;

    const inBin = resolved.filter((r) => {
      if (i === numBins - 1) {
        return r.predictedProbUp >= binMin && r.predictedProbUp <= binMax;
      }
      return r.predictedProbUp >= binMin && r.predictedProbUp < binMax;
    });

    const count = inBin.length;
    const predictedAvg =
      count > 0 ? inBin.reduce((sum, r) => sum + r.predictedProbUp, 0) / count : binMid;
    const empiricalWinRate =
      count > 0 ? inBin.reduce((sum, r) => sum + (r.actualOutcome as number), 0) / count : binMid;

    buckets.push({
      binMin,
      binMax,
      binMid: Number(binMid.toFixed(2)),
      predictedAvg: Number(predictedAvg.toFixed(3)),
      empiricalWinRate: Number(empiricalWinRate.toFixed(3)),
      count,
    });
  }

  return buckets;
}

/**
 * Computes dynamic spread multiplier based on the Brier calibration score.
 * If model is well-calibrated (Brier < 0.12), spread multiplier approaches 1.0.
 * If model is miscalibrated (Brier > 0.20), widens spread to protect inventory.
 */
export function computeDynamicSpreadMultiplier(brierScore: number): number {
  if (brierScore <= 0.12) {
    return 1.0;
  }
  // Scales from 1.0 up to 2.0 as Brier approaches 0.30
  const excess = Math.max(0, brierScore - 0.12);
  return Number((1.0 + Math.min(1.0, excess * 4)).toFixed(2));
}

/**
 * Compiles full calibration statistics from prediction history.
 */
export function getCalibrationStats(records: PredictionRecord[]): CalibrationStats {
  const resolved = records.filter(
    (r) => r.actualOutcome !== undefined && (r.actualOutcome === 0 || r.actualOutcome === 1)
  );
  const brierScore = computeBrierScore(records);

  return {
    totalPredictions: records.length,
    resolvedPredictions: resolved.length,
    brierScore,
    unresolvedCount: records.length - resolved.length,
    reliabilityBuckets: computeReliabilityBuckets(records),
    spreadMultiplier: computeDynamicSpreadMultiplier(brierScore),
  };
}

