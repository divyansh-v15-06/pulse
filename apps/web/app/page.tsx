import Link from "next/link";
import { ArrowRight, ShieldAlert, Cpu, Sparkles, Coins, RefreshCcw, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="py-6">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto my-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/70 border border-blue-800/60 text-blue-400 text-xs font-mono mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Somnia × DreamDEX Event Contracts Protocol
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Closed-Loop Liquidity & <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">
            Capital Recycling Flywheel
          </span>
        </h1>

        <p className="mt-4 text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          In 15-minute event contracts, settled markets drop out of standard views, leaving retail payouts stranded while new windows launch empty. Pulse recovers lost capital and pumps it straight into autonomous zero-inventory market making on Somnia.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/claims"
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
          >
            <ShieldAlert className="w-4 h-4" />
            Launch Capital Radar
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/agent"
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-all border border-slate-700 flex items-center justify-center gap-2"
          >
            <Cpu className="w-4 h-4 text-blue-400" />
            Open Quoting Terminal
          </Link>
        </div>
      </div>

      {/* Flywheel Architecture Grid */}
      <div className="my-16">
        <div className="text-center mb-10">
          <h2 className="text-xs font-mono uppercase tracking-widest text-slate-500">
            Protocol Architecture
          </h2>
          <div className="text-2xl font-bold text-white mt-1">
            The 4-Step Capital Velocity Loop
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#080d1e] border border-slate-800/80 rounded-xl p-5 relative overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800 flex items-center justify-center mb-4">
              <Coins className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-xs font-mono text-emerald-400">Step 1</div>
            <h3 className="text-base font-bold text-slate-100 mt-1">Capital Radar</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Bypasses `loadMarkets()` limits to audit finalized Somnia binary contracts directly, discovering unredeemed user winnings.
            </p>
          </div>

          <div className="bg-[#080d1e] border border-slate-800/80 rounded-xl p-5 relative overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-blue-950/60 border border-blue-800 flex items-center justify-center mb-4">
              <RefreshCcw className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-xs font-mono text-blue-400">Step 2</div>
            <h3 className="text-base font-bold text-slate-100 mt-1">Auto-Recycle Flow</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Single-tx batch redemption via `redeemMany()` with instant deposit into the Quoting Agent vault to avoid idle capital.
            </p>
          </div>

          <div className="bg-[#080d1e] border border-slate-800/80 rounded-xl p-5 relative overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-indigo-950/60 border border-indigo-800 flex items-center justify-center mb-4">
              <Cpu className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-xs font-mono text-indigo-400">Step 3</div>
            <h3 className="text-base font-bold text-slate-100 mt-1">Zero-Inventory MM</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Black-Scholes cash-or-nothing delta pricing (P = N(d2)) with Avellaneda-Stoikov inventory skewing and pair-minting.
            </p>
          </div>

          <div className="bg-[#080d1e] border border-slate-800/80 rounded-xl p-5 relative overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-purple-950/60 border border-purple-800 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-xs font-mono text-purple-400">Step 4</div>
            <h3 className="text-base font-bold text-slate-100 mt-1">Somnia Attestation</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Decision hashes and live Brier calibration scores are cryptographically sealed to `PulseAudit.sol` on Somnia Shannon L1.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
