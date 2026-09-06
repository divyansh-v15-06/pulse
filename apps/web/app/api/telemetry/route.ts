import { NextResponse } from "next/server";
import { getTelemetry, getPredictions } from "../../../lib/agentState";
import { getCalibrationStats } from "@pulse/core";

export const dynamic = "force-dynamic";

export async function GET() {
  const telemetry = getTelemetry();
  const predictions = getPredictions();
  const stats = getCalibrationStats(predictions);

  return NextResponse.json({
    ...telemetry,
    stats,
  });
}

