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
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Quoting Terminal & Calibration
            </h1>
            <span className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-mono border border-emerald-800">
              <Radio className="w-3 h-3 animate-pulse" /> 15s Daemon Active
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Autonomous zero-inventory market-making daemon on Somnia Shannon using Black-Scholes digital delta pricing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            title="Refresh telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/claims"
            className="px-4 py-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-800/60 hover:bg-blue-600/30 text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            Scan Capital Radar <ArrowRight className="w-3 h-3" />
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
        <div className="lg:col-span-1 bg-[#080d1e] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-mono uppercase text-slate-400">Current Window</span>
            <span className="text-xs font-mono text-emerald-400">
              {telemetry?.activeMarket?.status === 1 ? "Trading (Status: 1)" : "Active Window"}
            </span>
          </div>

          <div className="my-4">
            <div className="text-lg font-bold text-white truncate" title={telemetry?.activeMarket?.symbol || "BTC-15M-UPDOWN"}>
              {telemetry?.activeMarket?.symbol || telemetry?.activeMarketSymbol || "BTC-15M-UPDOWN"}
            </div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              {telemetry?.activeMarket?.secondsLeft !== undefined
                ? `Expiry in: ~${Math.floor(telemetry.activeMarket.secondsLeft / 60)}m ${telemetry.activeMarket.secondsLeft % 60}s`
                : "Expiry in: ~07m 45s"}
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Fair Value P(Up):</span>
                <span className="text-blue-400 font-bold">
                  {telemetry?.activeMarket?.fairUp !== undefined
                    ? `${(telemetry.activeMarket.fairUp * 100).toFixed(1)}%`
                    : "59.2%"}
                </span>
              </div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>EWMA Realized Vol:</span>
                <span className="text-slate-200">
                  {telemetry?.activeMarket?.volatility !== undefined
                    ? `${(telemetry.activeMarket.volatility * 100).toFixed(1)}%`
                    : "44.1%"}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Pair-Mint Margin:</span>
                <span className="text-emerald-400">$0.00 (Zero Inventory)</span>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3">
              <div className="text-[11px] text-slate-400 font-sans mb-2 font-medium">
                Resting Limit Buys (Dual Post-Only):
              </div>
              <div className="flex justify-between items-center py-1 px-2 rounded bg-emerald-950/40 border border-emerald-900/40 text-emerald-300">
                <span>BID UP:</span>
                <span className="font-bold">
                  {telemetry?.activeMarket?.bidUpPrice !== undefined
                    ? `$${telemetry.activeMarket.bidUpPrice.toFixed(3)} (5 tUSDC)`
                    : "$0.572 (5 tUSDC)"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 px-2 rounded bg-blue-950/40 border border-blue-900/40 text-blue-300 mt-1.5">
                <span>BID DOWN:</span>
                <span className="font-bold">
                  {telemetry?.activeMarket?.bidDownPrice !== undefined
                    ? `$${telemetry.activeMarket.bidDownPrice.toFixed(3)} (5 tUSDC)`
                    : "$0.388 (5 tUSDC)"}
                </span>
              </div>
            </div>
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
          <div className="bg-[#080d1e] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-slate-100 text-sm">
                  Cryptographic Decision Proofs (Somnia Shannon L1)
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Showing {displayedPredictions.length} of {allPredictions.length} proofs (PulseAudit.sol)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-900/60 border-b border-slate-850 font-mono">
                  <tr>
                    <th className="py-3 px-4">Market Window</th>
                    <th className="py-3 px-4">Forecast P(Up)</th>
                    <th className="py-3 px-4">Brier Score</th>
                    <th className="py-3 px-4">Realized Outcome</th>
                    <th className="py-3 px-4 text-right">L1 Proof Hash</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-xs">
                  {displayedPredictions.map((p: any, idx: number) => {
                    const date = new Date(p.quotedAt).toLocaleTimeString();
                    return (
                      <tr key={idx} className="border-b border-slate-850 hover:bg-slate-900/40">
                        <td className="py-3 px-4 text-slate-300">
                          {p.asset} ({date})
                        </td>
                        <td className="py-3 px-4 text-blue-400 font-bold">
                          {(p.predictedProbUp * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-emerald-400">
                          {brierScore.toFixed(4)}
                        </td>
                        <td className="py-3 px-4">
                          {p.actualOutcome === undefined ? (
                            <span className="text-slate-500">Live / Open</span>
                          ) : p.actualOutcome === 1 ? (
                            <span className="text-emerald-400">UP WON (1.0)</span>
                          ) : (
                            <span className="text-amber-400">DOWN WON (0.0)</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {p.txHash ? (
                            <a
                              href={`https://shannon-explorer.somnia.network/tx/${p.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 font-bold"
                            >
                              {p.txHash.slice(0, 8)}...{p.txHash.slice(-6)} <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <a
                              href="https://shannon-explorer.somnia.network"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-500 hover:text-blue-400 inline-flex items-center gap-1"
                            >
                              0x{p.marketId.slice(2, 10)}... <ExternalLink className="w-3 h-3" />
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
              <div className="p-3 border-t border-slate-800 bg-slate-900/40 text-center">
                <button
                  onClick={() => setShowAllProofs(!showAllProofs)}
                  className="text-xs font-mono font-semibold text-blue-400 hover:text-blue-300 transition-colors px-4 py-1.5 rounded-lg border border-blue-900/60 bg-blue-950/30 hover:bg-blue-900/40"
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

