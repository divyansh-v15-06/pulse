"use client";

import React from "react";
import { Cpu, Zap, Activity, ShieldCheck } from "lucide-react";

interface TelemetryRibbonProps {
  modelName: string;
  effectiveSpread: number;
  totalQuotes: number;
  brierScore: number;
  unhedgedCount: number;
}

export function TelemetryRibbon({
  modelName,
  effectiveSpread,
  totalQuotes,
  brierScore,
  unhedgedCount,
}: TelemetryRibbonProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-[#090e1f] border border-slate-800 rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-950/60 border border-blue-800 flex items-center justify-center shrink-0">
          <Cpu className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <div className="text-[11px] font-mono text-slate-500 uppercase">Pricing Engine</div>
          <div className="text-sm font-bold text-slate-100 truncate" title={modelName}>
            {modelName === "BlackScholesBinaryModel" ? "Black-Scholes Digital" : modelName}
          </div>
        </div>
      </div>

      <div className="bg-[#090e1f] border border-slate-800 rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800 flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <div className="text-[11px] font-mono text-slate-500 uppercase">Dynamic Spread</div>
          <div className="text-sm font-bold text-emerald-400 font-mono">
            {(effectiveSpread * 100).toFixed(1)}% (Dual Post-Only)
          </div>
        </div>
      </div>

      <div className="bg-[#090e1f] border border-slate-800 rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-indigo-950/60 border border-indigo-800 flex items-center justify-center shrink-0">
          <Activity className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <div className="text-[11px] font-mono text-slate-500 uppercase">Quotes Placed</div>
          <div className="text-sm font-bold text-slate-100 font-mono">
            {totalQuotes} Resting Orders
          </div>
        </div>
      </div>

      <div className="bg-[#090e1f] border border-slate-800 rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-800 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <div className="text-[11px] font-mono text-slate-500 uppercase">Brier Calibration</div>
          <div className="text-sm font-bold text-amber-300 font-mono">
            {brierScore.toFixed(4)} (Calibrated)
          </div>
        </div>
      </div>
    </div>
  );
}

