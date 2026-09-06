"use client";

import React from "react";
import { Coins, ArrowRightLeft, Sparkles, CheckCircle2 } from "lucide-react";

interface ClaimSummaryCardProps {
  totalClaimable: number;
  positionCount: number;
  selectedCount: number;
  onClaimAll: () => void;
  onClaimAndRecycle: () => void;
  isClaiming: boolean;
  txHash?: string;
}

export function ClaimSummaryCard({
  totalClaimable,
  positionCount,
  selectedCount,
  onClaimAll,
  onClaimAndRecycle,
  isClaiming,
  txHash,
}: ClaimSummaryCardProps) {
  return (
    <div className="bg-gradient-to-br from-[#0c1329] to-[#070c1a] border border-blue-900/40 rounded-xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-blue-400 uppercase">
            <Coins className="w-4 h-4" />
            Stranded Capital Recovery
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white tracking-tight">
              {totalClaimable.toFixed(2)}
            </span>
            <span className="text-lg font-medium text-slate-400">tUSDC</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Discovered across {positionCount} finalized binary markets ({selectedCount} selected).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={onClaimAll}
            disabled={isClaiming || positionCount === 0}
            className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-all border border-slate-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            Claim to Wallet
          </button>

          <button
            onClick={onClaimAndRecycle}
            disabled={isClaiming || positionCount === 0}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 flex items-center justify-center gap-2 group"
          >
            <Sparkles className="w-4 h-4 text-blue-200 group-hover:rotate-12 transition-transform" />
            Claim & Auto-Recycle (One-Click)
            <ArrowRightLeft className="w-4 h-4 text-blue-200" />
          </button>
        </div>
      </div>

      {txHash && (
        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-2 text-xs text-emerald-400 font-mono">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Batch redemption submitted: </span>
          <a
            href={`https://shannon-explorer.somnia.network/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-emerald-300"
          >
            {txHash.slice(0, 10)}...{txHash.slice(-8)}
          </a>
        </div>
      )}
    </div>
  );
}

