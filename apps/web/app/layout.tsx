import "./globals.css";
import { Providers } from "./providers";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { Activity, ShieldAlert, Cpu } from "lucide-react";

export const metadata = {
  title: "Pulse — Closed-Loop Liquidity Protocol",
  description: "Autonomous Capital Recycling & Quoting Protocol for DreamDEX on Somnia L1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#040711] text-slate-100 min-h-screen flex flex-col">
        <Providers>
          {/* Global Header */}
          <header className="border-b border-slate-800 bg-[#070b19]/80 backdrop-blur sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-xl font-bold tracking-tight text-white">
                      PULSE
                    </span>
                    <span className="text-xs px-2 py-0.5 ml-2 rounded bg-blue-900/60 text-blue-400 font-mono border border-blue-800">
                      SOMNIA L1
                    </span>
                  </div>
                </Link>

                <nav className="hidden md:flex items-center space-x-1">
                  <Link
                    href="/claims"
                    className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center gap-1.5 transition-colors"
                  >
                    <ShieldAlert className="w-4 h-4 text-emerald-400" />
                    Capital Radar
                  </Link>
                  <Link
                    href="/agent"
                    className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center gap-1.5 transition-colors"
                  >
                    <Cpu className="w-4 h-4 text-blue-400" />
                    Quoting Terminal
                  </Link>
                </nav>
              </div>

              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/50 border border-emerald-800/50 text-emerald-400 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Shannon Testnet
                </div>
                <ConnectButton
                  showBalance={false}
                  chainStatus="icon"
                  accountStatus="address"
                />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-900 bg-[#03050c] py-4 text-center text-xs text-slate-500">
            Pulse Protocol × Somnia Shannon Testnet × DreamDEX Event Contracts Hackathon (DoraHacks)
          </footer>
        </Providers>
      </body>
    </html>
  );
}

