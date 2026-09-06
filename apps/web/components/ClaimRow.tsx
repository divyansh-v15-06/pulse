"use client";

import React from "react";
import { ExternalLink, CheckCircle2, AlertTriangle } from "lucide-react";
import { ClaimablePositionView } from "@pulse/core";

interface ClaimRowProps {
  position: ClaimablePositionView;
  isSelected: boolean;
  onToggle: (marketId: string) => void;
}

export function ClaimRow({ position, isSelected, onToggle }: ClaimRowProps) {
  const expiryDate = new Date(position.expiry * 1000).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <tr
      className={`border-b border-slate-850 transition-colors hover:bg-slate-900/40 ${
        isSelected ? "bg-blue-950/20" : ""
      }`}
    >
      <td className="py-4 px-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(position.marketId)}
          className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
        />
      </td>

      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-white">
            {position.asset.slice(0, 3)}
          </div>
          <div>
            <div className="font-semibold text-slate-100">{position.asset} / tUSDC</div>
            <div className="text-xs text-slate-400">Settled: {expiryDate}</div>
          </div>
        </div>
      </td>

      <td className="py-4 px-4">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
            position.isVoided
              ? "bg-amber-950/60 text-amber-300 border border-amber-800/50"
              : "bg-emerald-950/60 text-emerald-300 border border-emerald-800/50"
          }`}
        >
          {position.isVoided ? (
            <AlertTriangle className="w-3 h-3" />
          ) : (
            <CheckCircle2 className="w-3 h-3" />
          )}
          {position.outcomeLabel} ({position.outcomeSymbol})
        </span>
      </td>

      <td className="py-4 px-4 text-right">
        <div className="font-mono font-bold text-emerald-400 text-base">
          +{position.claimableAmount.toFixed(2)} tUSDC
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Bal: {position.balanceRaw}
        </div>
      </td>

      <td className="py-4 px-4 text-center">
        {position.oracleAuditUrl ? (
          <a
            href={position.oracleAuditUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors underline-offset-4 hover:underline"
            title="View cryptographic proof on Somnia Oracle visualizer"
          >
            Verify <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-xs text-slate-600">On-Chain</span>
        )}
      </td>
    </tr>
  );
}

