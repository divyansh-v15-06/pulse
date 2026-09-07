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
    <div className="glass-panel relative overflow-hidden rounded-2xl p-6 border border-white/10 shadow-2xl">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500/60 via-indigo-500/60 to-purple-500/60" />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center glow-pill-blue">
              <Target className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Model Calibration Curve (Reliability Diagram)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Empirical win rate vs. forecast probability. A perfectly calibrated market maker tracks the 45° diagonal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-right backdrop-blur-md glow-pill-emerald">
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Brier Score</div>
            <div className="text-lg font-black font-mono text-emerald-400 tracking-tight">
              {brierScore.toFixed(4)}
            </div>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-right backdrop-blur-md">
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Resolved Windows</div>
            <div className="text-lg font-black font-mono text-slate-100 tracking-tight">
              {totalResolved}
            </div>
          </div>
        </div>
      </div>

      <div className="h-72 w-full mt-5">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 20, bottom: 20, left: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
            <XAxis
              dataKey="mid"
              type="number"
              domain={[0, 1]}
              tickCount={6}
              tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              stroke="#64748b"
              fontSize={11}
              label={{
                value: "Predicted Probability P(Up)",
                position: "insideBottom",
                offset: -10,
                fill: "#94a3b8",
                fontSize: 11,
              }}
            />
            <YAxis
              type="number"
              domain={[0, 1]}
              tickCount={6}
              tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              stroke="#64748b"
              fontSize={11}
              label={{
                value: "Actual Fraction Resolved Up",
                angle: -90,
                position: "insideLeft",
                offset: 5,
                fill: "#94a3b8",
                fontSize: 11,
              }}
            />
            <Tooltip
              content={({ payload }) => {
                if (!payload || payload.length === 0) return null;
                const data = payload[0].payload;
                return (
                  <div className="glass-panel p-3.5 rounded-xl text-xs shadow-2xl font-mono border border-white/15">
                    <div className="text-slate-300 font-bold mb-1.5 pb-1 border-b border-white/10">Bucket: {(data.mid * 100).toFixed(0)}%</div>
                    <div className="text-blue-400 font-semibold">Forecast: {((data.predicted || data.mid) * 100).toFixed(1)}%</div>
                    <div className="text-emerald-400 font-semibold mt-0.5">
                      Realized: {data.empirical !== null ? `${(data.empirical * 100).toFixed(1)}%` : "Pending Settlement"}
                    </div>
                    <div className="text-slate-400 text-[10px] mt-1">Sample Count: {data.count}</div>
                  </div>
                );
              }}
            />
            {/* 45 degree perfect calibration line */}
            <ReferenceLine
              stroke="#38bdf8"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              strokeOpacity={0.8}
              segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]}
            />
            {/* Realized empirical curve line */}
            <Line
              type="monotone"
              dataKey="empirical"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 5, fill: "#10b981", stroke: "#34d399", strokeWidth: 2 }}
              activeDot={{ r: 7, fill: "#34d399", stroke: "#ffffff", strokeWidth: 2 }}
              connectNulls={true}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 mt-3 pt-3 border-t border-white/5 px-2">
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)] inline-block" />
          <span className="font-mono text-[11px]">Ideal Diagonal (P = Outcome)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] inline-block" />
          <span className="font-mono text-[11px]">Pulse Realized Settlements</span>
        </div>
      </div>
    </div>
  );
}
