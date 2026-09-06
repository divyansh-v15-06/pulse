import { NextResponse } from "next/server";
import { getPredictions } from "../../../lib/agentState";
import { getCalibrationStats } from "@pulse/core";

export const dynamic = "force-dynamic";

export async function GET() {
  const predictions = getPredictions();
  const stats = getCalibrationStats(predictions);

  return NextResponse.json({
    predictions,
    stats,
  });
}

