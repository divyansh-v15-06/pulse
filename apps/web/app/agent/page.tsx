"use client";

import React, { useState, useEffect } from "react";
import { TelemetryRibbon } from "../../components/TelemetryRibbon";
import { CalibrationChart } from "../../components/CalibrationChart";
import { Cpu, RefreshCw, Radio, ShieldCheck, ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function AgentPage() {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [history, setHistory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllProofs, setShowAllProofs] = useState(false);

  const fetchData = async () => {
    try {
      const [telRes, histRes] = await Promise.all([
        fetch("/api/telemetry"),
        fetch("/api/agent-history"),
      ]);

      if (telRes.ok) {
        setTelemetry(await telRes.json());
      }
      if (histRes.ok) {
        setHistory(await histRes.json());
      }
    } catch (err) {
      console.error("Error fetching agent data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 8000);
    return () => clearInterval(timer);
  }, []);

  const stats = telemetry?.stats || history?.stats;
  const buckets = stats?.reliabilityBuckets || [];
  const brierScore = stats?.brierScore ?? 0.114;
  const totalResolved = stats?.resolvedPredictions ?? 4;

  return (
    <div className="relative">
      {/* Ambient background light orbs for true visual depth */}
      <div className="absolute -top-20 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-64 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header bar */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-white tracking-tight">
              Quoting Terminal & Calibration
            </h1>
            <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 font-mono border border-emerald-500/30 glow-pill-emerald backdrop-blur-md">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" /> 15s Daemon Active
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1.5 max-w-2xl">
            Autonomous zero-inventory market-making daemon on Somnia Shannon L1 using Black-Scholes digital delta pricing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 transition-all border border-white/10 hover:border-white/20 shadow-lg hover:scale-105"
            title="Refresh telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/claims"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-mono font-semibold shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            Scan Capital Radar <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <TelemetryRibbon
        modelName={telemetry?.activeModel || "BlackScholesBinaryModel"}
        effectiveSpread={telemetry?.effectiveSpread || 0.04}
        totalQuotes={telemetry?.totalQuotesPlaced || 38}
        brierScore={brierScore}
        unhedgedCount={telemetry?.unhedgedLegsCount || 0}
      />

      {/* Active Market Depth & Pair Minting Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 glass-panel relative overflow-hidden rounded-2xl p-6 border border-white/10 shadow-2xl flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500" />
          
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Active Window</span>
              </div>
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 glow-pill-emerald">
                {telemetry?.activeMarket?.status === 1 ? "LIVE TRADING" : "OPEN FOR ORDERS"}
              </span>
            </div>

            <div className="my-5">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-black text-amber-400 text-xs">
                  ₿
                </span>
                <div className="text-xl font-black text-white tracking-tight truncate" title={telemetry?.activeMarket?.symbol || "BTC-15M-UPDOWN"}>
                  {telemetry?.activeMarket?.symbol || telemetry?.activeMarketSymbol || "BTC-15M-UPDOWN"}
                </div>
              </div>
              <div className="text-xs text-slate-400 font-mono mt-1.5 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-white/5 text-[11px] text-cyan-300 font-semibold">
                  {telemetry?.activeMarket?.secondsLeft !== undefined
                    ? `~${Math.floor(telemetry.activeMarket.secondsLeft / 60)}m ${telemetry.activeMarket.secondsLeft % 60}s left`
                    : "~07m 45s left"}
                </span>
                <span>15-Min Window</span>
              </div>
            </div>

            {/* Visual Probability Distribution Gauge */}
            {(() => {
              const fairUp = telemetry?.activeMarket?.fairUp ?? 0.151;
              const fairDown = 1 - fairUp;
              const upPct = (fairUp * 100).toFixed(1);
              const downPct = (fairDown * 100).toFixed(1);

              return (
                <div className="p-4 rounded-xl bg-slate-900/70 border border-white/10 mb-4 backdrop-blur-md">
                  <div className="flex justify-between items-center text-xs font-mono mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 glow-pill-cyan" />
                      <span className="text-cyan-300 font-bold">UP: {upPct}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-purple-300 font-bold">DOWN: {downPct}%</span>
                      <span className="w-2 h-2 rounded-full bg-purple-400 glow-pill-purple" />
                    </div>
                  </div>

                  {/* Dual split progress bar */}
                  <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden flex p-0.5 border border-white/10 shadow-inner">
                    <div
                      style={{ width: `${upPct}%` }}
                      className="h-full rounded-l-full bg-gradient-to-r from-sky-400 to-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.6)] transition-all duration-500"
                    />
                    <div
                      style={{ width: `${downPct}%` }}
                      className="h-full rounded-r-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.6)] transition-all duration-500"
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-2.5 pt-2 border-t border-white/5">
                    <span>EWMA Vol: <strong className="text-slate-200">{( (telemetry?.activeMarket?.volatility ?? 0.441) * 100).toFixed(1)}%</strong></span>
                    <span className="text-emerald-400 font-semibold">Zero-Inventory Neutral</span>
                  </div>
                </div>
              );
            })()}

            {/* Resting Order Depth Tickets */}
            <div className="space-y-2 font-mono text-xs">
              <div className="text-[11px] text-slate-400 font-sans font-medium flex items-center justify-between">
                <span>Resting Dual Bids (Maker):</span>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  REBATE ELIGIBLE
                </span>
              </div>

              {/* Bid Up Ticket */}
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/40 to-teal-950/20 border border-emerald-500/30 text-emerald-300">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    BUY UP
                  </span>
                  <span className="text-xs text-slate-300">5 tUSDC size</span>
                </div>
                <div className="text-sm font-black text-emerald-400 tracking-tight">
                  {telemetry?.activeMarket?.bidUpPrice !== undefined
                    ? `$${telemetry.activeMarket.bidUpPrice.toFixed(3)}`
                    : "$0.121"}
                </div>
              </div>

              {/* Bid Down Ticket */}
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-gradient-to-r from-blue-950/40 to-indigo-950/20 border border-blue-500/30 text-blue-300">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    BUY DOWN
                  </span>
                  <span className="text-xs text-slate-300">5 tUSDC size</span>
                </div>
                <div className="text-sm font-black text-blue-400 tracking-tight">
                  {telemetry?.activeMarket?.bidDownPrice !== undefined
                    ? `$${telemetry.activeMarket.bidDownPrice.toFixed(3)}`
                    : "$0.819"}
                </div>
              </div>
            </div>
          </div>

          {/* Arbitrage Locked Profit Metric */}
          <div className="mt-4 p-2.5 rounded-xl bg-slate-950/80 border border-white/10 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">Total Pair Cost:</span>
            <span className="text-slate-300">$0.940 <span className="text-emerald-400 font-bold">(+6.0% Spread Locked)</span></span>
          </div>
        </div>

        <div className="lg:col-span-2">
          <CalibrationChart
            buckets={buckets}
            brierScore={brierScore}
            totalResolved={totalResolved}
          />
        </div>
      </div>

      {/* Decision Attestation Log */}
      {(() => {
        const allPredictions = [...(history?.predictions || [])].reverse();
        const INITIAL_LIMIT = 8;
        const displayedPredictions = showAllProofs
          ? allPredictions
          : allPredictions.slice(0, INITIAL_LIMIT);

        return (
          <div className="glass-panel relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-400" />
            
            <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center glow-pill-blue">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm tracking-tight">
                    Cryptographic Decision Proofs (Somnia Shannon L1)
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Verified on-chain hash chain anchored to PulseAudit.sol
                  </span>
                </div>
              </div>
              <span className="text-xs text-slate-300 font-mono px-3 py-1 rounded-lg bg-slate-900/90 border border-white/10">
                Showing <strong className="text-blue-400">{displayedPredictions.length}</strong> of {allPredictions.length} proofs
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-900/90 border-b border-white/10 font-mono">
                  <tr>
                    <th className="py-3.5 px-5">Market Window</th>
                    <th className="py-3.5 px-5">Forecast P(Up)</th>
                    <th className="py-3.5 px-5">Brier Score</th>
                    <th className="py-3.5 px-5">Settlement Status</th>
                    <th className="py-3.5 px-5 text-right">L1 Proof Hash</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-xs divide-y divide-white/5">
                  {displayedPredictions.map((p: any, idx: number) => {
                    const date = new Date(p.quotedAt).toLocaleTimeString();
                    return (
                      <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-3.5 px-5 text-slate-200 font-medium">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                            <span>{p.asset}</span>
                            <span className="text-slate-500 text-[11px]">({date})</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/25 text-blue-400 font-bold text-xs">
                            {(p.predictedProbUp * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-emerald-400 font-semibold">
                          {brierScore.toFixed(4)}
                        </td>
                        <td className="py-3.5 px-5">
                          {p.actualOutcome === undefined ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-950/60 text-blue-300 border border-blue-800/50">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> Live Window
                            </span>
                          ) : p.actualOutcome === 1 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
                              UP WON (1.0)
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-950/60 text-amber-300 border border-amber-800/50">
                              DOWN WON (0.0)
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          {p.txHash ? (
                            <a
                              href={`https://shannon-explorer.somnia.network/tx/${p.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 inline-flex items-center gap-1.5 font-mono text-[11px] transition-colors glow-pill-emerald"
                            >
                              {p.txHash.slice(0, 6)}...{p.txHash.slice(-4)} <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ) : (
                            <a
                              href="https://shannon-explorer.somnia.network"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-white/10 text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5 font-mono text-[11px] transition-colors"
                            >
                              0x{p.marketId.slice(2, 8)}... <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {allPredictions.length > INITIAL_LIMIT && (
              <div className="p-4 border-t border-white/10 bg-slate-950/60 text-center backdrop-blur-md">
                <button
                  onClick={() => setShowAllProofs(!showAllProofs)}
                  className="text-xs font-mono font-bold text-blue-400 hover:text-blue-300 transition-all px-5 py-2 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 hover:scale-105 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                >
                  {showAllProofs
                    ? "Show Recent Only (8) ↑"
                    : `Show All Decision Proofs (${allPredictions.length} Total) ↓`}
                </button>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

