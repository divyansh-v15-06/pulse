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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Card 1: Pricing Engine */}
      <div className="glass-card relative overflow-hidden rounded-2xl p-5 border border-white/10 hover:border-blue-500/30 group">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-cyan-400 to-transparent" />
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              <span>Pricing Engine</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            </div>
            <div className="text-base font-extrabold text-white tracking-tight" title={modelName}>
              {modelName === "BlackScholesBinaryModel" ? "Black-Scholes Digital" : modelName}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono text-blue-300/80">
              <span className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">Analytical</span>
              <span>N(d₂) Closed-Form</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 glow-pill-blue group-hover:scale-105 transition-transform">
            <Cpu className="w-5 h-5 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Card 2: Dynamic Spread */}
      <div className="glass-card relative overflow-hidden rounded-2xl p-5 border border-white/10 hover:border-emerald-500/30 group">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-transparent" />
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              <span>Dynamic Spread</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-xl font-extrabold text-emerald-400 font-mono tracking-tight">
              {(effectiveSpread * 100).toFixed(1)}%
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono text-emerald-300/80">
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">Dual Post-Only</span>
              <span>Maker Rebates</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30 flex items-center justify-center shrink-0 glow-pill-emerald group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Card 3: Quotes Placed */}
      <div className="glass-card relative overflow-hidden rounded-2xl p-5 border border-white/10 hover:border-indigo-500/30 group">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-400 to-transparent" />
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              <span>Quotes Placed</span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            </div>
            <div className="text-xl font-extrabold text-slate-100 font-mono tracking-tight">
              {totalQuotes} <span className="text-xs text-slate-400 font-normal">Resting</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono text-indigo-300/80">
              <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">CLOB Book</span>
              <span>Somnia L1</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 glow-pill-purple group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Card 4: Brier Score */}
      <div className="glass-card relative overflow-hidden rounded-2xl p-5 border border-white/10 hover:border-amber-500/30 group">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-orange-400 to-transparent" />
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              <span>Brier Calibration</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            </div>
            <div className="text-xl font-extrabold text-amber-300 font-mono tracking-tight">
              {brierScore.toFixed(4)}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono text-amber-300/80">
              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">Reliability Score</span>
              <span>P = Outcome</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 flex items-center justify-center shrink-0 glow-pill-amber group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

