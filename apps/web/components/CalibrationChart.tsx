"use client";

import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { CalibrationBucket } from "@pulse/core";
import { Target, Info } from "lucide-react";

interface CalibrationChartProps {
  buckets: CalibrationBucket[];
  brierScore: number;
  totalResolved: number;
}

export function CalibrationChart({
  buckets,
  brierScore,
  totalResolved,
}: CalibrationChartProps) {
  // Diagonal reference points [0,0] to [1,1]
  const chartData = (buckets || []).map((b) => ({
    mid: b.binMid,
    predicted: b.predictedAvg,
    empirical: b.count > 0 ? b.empiricalWinRate : null,
    diagonal: b.binMid,
    count: b.count,
  }));

  // Ensure diagonal line endpoints exist
  const diagonalLineData = [
    { x: 0, y: 0 },
    { x: 0.2, y: 0.2 },
    { x: 0.4, y: 0.4 },
    { x: 0.6, y: 0.6 },
    { x: 0.8, y: 0.8 },
    { x: 1.0, y: 1.0 },
  ];

  return (
    <div className="bg-[#080d1e] border border-slate-800 rounded-xl p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-slate-100">
              Model Calibration Curve (Reliability Diagram)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Empirical win rate vs. forecast probability. A perfectly calibrated market maker tracks the 45° diagonal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-right">
            <div className="text-[10px] text-slate-500 uppercase font-mono">Brier Score</div>
            <div className="text-base font-bold font-mono text-emerald-400">
              {brierScore.toFixed(4)}
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-right">
            <div className="text-[10px] text-slate-500 uppercase font-mono">Resolved Windows</div>
            <div className="text-base font-bold font-mono text-slate-200">
              {totalResolved}
            </div>
          </div>
        </div>
      </div>

      <div className="h-72 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 20, bottom: 20, left: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="mid"
              type="number"
              domain={[0, 1]}
              tickCount={6}
              tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              stroke="#64748b"
              fontSize={12}
              label={{
                value: "Predicted Probability P(Up)",
                position: "insideBottom",
                offset: -10,
                fill: "#64748b",
                fontSize: 11,
              }}
            />
            <YAxis
              type="number"
              domain={[0, 1]}
              tickCount={6}
              tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              stroke="#64748b"
              fontSize={12}
              label={{
                value: "Actual Fraction Resolved Up",
                angle: -90,
                position: "insideLeft",
                offset: 5,
                fill: "#64748b",
                fontSize: 11,
              }}
            />
            <Tooltip
              content={({ payload }) => {
                if (!payload || payload.length === 0) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg text-xs shadow-xl font-mono">
                    <div className="text-slate-400 font-bold mb-1">Bucket: {(data.mid * 100).toFixed(0)}%</div>
                    <div className="text-blue-400">Predicted Avg: {((data.predicted || data.mid) * 100).toFixed(1)}%</div>
                    <div className="text-emerald-400">
                      Realized Rate: {data.empirical !== null ? `${(data.empirical * 100).toFixed(1)}%` : "Pending"}
                    </div>
                    <div className="text-slate-500">Sample Count: {data.count}</div>
                  </div>
                );
              }}
            />
            {/* 45 degree perfect calibration line */}
            <ReferenceLine
              stroke="#3b82f6"
              strokeDasharray="5 5"
              strokeOpacity={0.6}
              segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]}
            />
            {/* Realized empirical points */}
            <Scatter
              name="Empirical Win Rate"
              dataKey="empirical"
              fill="#10b981"
              stroke="#047857"
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 mt-2 px-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-blue-500 inline-block" />
          <span>Ideal Diagonal (P = Outcome)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span>Pulse Realized Settlements</span>
        </div>
      </div>
    </div>
  );
}
