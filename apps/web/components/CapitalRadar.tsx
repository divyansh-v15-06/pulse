"use client";

import React from "react";
import { Radio, RefreshCw } from "lucide-react";

interface CapitalRadarProps {
  isScanning: boolean;
  scannedCount: number;
  foundCount: number;
  totalAmount: number;
  onRescan: () => void;
}

export function CapitalRadar({
  isScanning,
  scannedCount,
  foundCount,
  totalAmount,
  onRescan,
}: CapitalRadarProps) {
  return (
    <div className="bg-[#090e1f] border border-slate-800 rounded-xl p-5 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Animated Radar Pulse Indicator */}
          <div className="relative w-12 h-12 rounded-full bg-blue-950/70 border border-blue-600/40 flex items-center justify-center shrink-0">
            {isScanning ? (
              <>
                <div className="absolute inset-0 rounded-full border border-blue-500 animate-ping opacity-30" />
                <div className="absolute inset-2 rounded-full border border-blue-400 animate-spin opacity-50" />
                <Radio className="w-5 h-5 text-blue-400" />
              </>
            ) : (
              <Radio className="w-5 h-5 text-emerald-400" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100 tracking-tight">
                Capital Radar Scanner
              </h2>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isScanning
                    ? "bg-blue-950 text-blue-400 border border-blue-800"
                    : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                }`}
              >
                {isScanning ? "Scanning Indexer" : "Sync Complete"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Bypasses standard catalog limits to audit finalized Somnia binary contracts directly.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-6 text-xs font-mono">
            <div>
              <span className="text-slate-500 block">Scanned</span>
              <span className="text-slate-200 font-bold text-sm">
                {scannedCount} markets
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Found</span>
              <span className="text-emerald-400 font-bold text-sm">
                {foundCount} claims
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Value</span>
              <span className="text-blue-400 font-bold text-sm">
                +{totalAmount.toFixed(2)} tUSDC
              </span>
            </div>
          </div>

          <button
            onClick={onRescan}
            disabled={isScanning}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 disabled:opacity-50"
            title="Rescan finalized markets"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}

