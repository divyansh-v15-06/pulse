# Pulse — Project Context & Status Report

**Target Hackathon:** Somnia × DreamDEX Event Contracts Hackathon (DoraHacks)  
**Track:** Open Track (DeFi / Event Contracts / Prediction Markets / Autonomous Agents)  
**Prize Pool:** $5,000 USD (32 BUIDLs competing)  
**Current Timestamp:** 2026-09-06  
**Submission Deadline:** 2026-09-08 23:30 IST (~55 hours remaining)  
**Overall Readiness:** Codebase feature-complete & verified. Pending testnet gas funding, on-chain deployment, and video recording.

---

## 1. Executive Summary

Pulse is the **Closed-Loop Liquidity & Capital Recycling Protocol** for DreamDEX Event Contracts on Somnia Network. It solves two structural bottlenecks:

1. **Dead Capital / The Indexer Blindspot:** DreamDEX's standard `loadMarkets()` catalog omits finalized binary markets, causing winning payouts to vanish from retail frontend views. Pulse's **Capital Radar** scans the binary tier directly via `listBinaryMarkets({ status: "Finalized" })`, calculates payouts via `claimableFrom()`, links to Somnia Oracle visualizer graphs, and executes atomic batch redemptions via `redeemMany()`.
2. **Cold-Start Illiquidity & Toxic Inventory:** New market windows launch with empty order books. Pulse’s autonomous **Quoting Agent** quotes dual-sided `postOnly` limit buys using DreamDEX's zero-starting-inventory pair-minting mechanic, priced via closed-form Black-Scholes digital call delta $P(\text{Up}) = \mathcal{N}(d_2)$ with Avellaneda-Stoikov inventory skewing.

---

## 2. What Has Been Built & Shipped (Phases 1–7)

### A. Monorepo & Infrastructure Scaffold
* Configured root `package.json` with npm workspaces (`apps/web`, `packages/core`, `agent-worker`, `packages/contracts`).
* Resolved npm dependencies across all workspaces including `@somnia-chain/markets-sdk@0.29.0`, `viem@^2.21.54`, `wagmi@^2.12.7`, `@rainbow-me/rainbowkit@^2.1.4`, and `next@14.2.5`.
* Configured `.gitignore` and `.env.example`.

### B. Core Protocol Primitives (`@pulse/core`)
* **`client.ts`:** `SomniaMarkets` exchange factory pre-configured for Somnia Shannon testnet (`chainId: 50312`, official indexer `https://dev.smk.somnia.host/v1/graphql`, WS RPC `wss://api.infra.testnet.somnia.network/ws`). Implements `unwrapReceipt()` to safely extract receipts from `(order.info as PlaceOrderResult).receipt`.
* **`oracle.ts`:** Constructs deep links to Somnia's production oracle visualization graph (`https://prd.oracle.somnia.host/questions/{id}?view=graph`).
* **`redemptionTracker.ts`:** Scans finalized binary markets directly, queries outcome balances, reads live settlement fees, computes claimable amounts via `claimableFrom()`, and flags Resolved (100% win) vs. Voided (50% refund) outcomes.
* **`fairValueModel.ts`:** 
  * `MidFollowingModel`: Baseline fallback returning mid-price or 0.5.
  * `BlackScholesBinaryModel`: Analytical cash-or-nothing digital call delta $P(\text{Up}) = \mathcal{N}(d_2)$ using Abramowitz & Stegun polynomial normal CDF approximation and rolling EWMA volatility. Spot $S$ and strike $K$ are derived directly from DreamDEX's internal oracle candles (`fetchPriceCandles`).
* **`calibration.ts`:** Implements formal Brier score calculation $\frac{1}{N}\sum(f_t - o_t)^2$, decile binning for reliability diagrams, and dynamic spread modulation (widens quoting spreads if Brier score degrades).
* **`audit.ts`:** Formulates deterministic SHA-256 decision hashes over market parameters and dispatches on-chain transactions to `PulseAudit.sol` on Somnia Shannon.
* **`quotingAgent.ts`:** Autonomous market-making engine that filters candidate active windows, queries live on-chain status (`getMarketOnchain`), calculates fair value, applies Avellaneda-Stoikov inventory skewing, posts dual `postOnly` limit buys, and catches `PostOnlyWouldCross` errors gracefully.

### C. On-Chain Smart Contracts (`packages/contracts`)
* **`PulseAudit.sol`:** Immutable Solidity contract on Somnia Shannon Layer-1 recording `recordDecision(marketId, predictedProbBps, brierScoreBps, decisionHash)` and emitting `QuotingProofRecorded` events.

### D. Autonomous Agent Worker (`agent-worker`)
* **`run.ts`:** Long-lived Node.js daemon running the 15-second quoting loop.
* **`faucet-once.ts`:** Automated bootstrap script calling `exchange.trader.faucet()` to fund the agent wallet with 10,000 testnet tUSDC collateral.

### E. Next.js Web Terminal (`apps/web`)
* **Landing Page (`/`):** Interactive hero and 4-step Capital Recycling Flywheel architecture visualizer.
* **Capital Radar (`/claims`):** Connects user wallet via Wagmi/RainbowKit on Somnia Shannon, displays animated radar scanner sweep, renders table of discovered claimable contracts with Somnia Oracle links, and triggers batch redemption.
* **Quoting Terminal (`/agent`):** Displays telemetry ribbon, active window depth, Recharts reliability diagram (calibration curve vs. 45° diagonal), and on-chain decision proof history.
* **API Routes (`/api/claims`, `/api/telemetry`, `/api/agent-history`):** Server-side data aggregators.
* **Production Build Verified:** Executed `npm run build:web` (`next build`) with **exit code 0** across all 6 static and dynamic routes.

### F. Live Network Testing & Verification
* Successfully connected to Somnia Shannon Testnet via `@somnia-chain/markets-sdk`.
* Loaded **605 total markets** and identified **578 active binary contracts**.
* Executed `getMarketOnchain` to verify raw on-chain state storage resolution directly from Somnia Shannon.
* Executed single-pass test quoting against live testnet markets, successfully calculating Black-Scholes pricing ($P=0.709$ on ETH-UP) and dynamic spread (6.1%).

---

## 3. What Is Left to Build / Pre-Submission Checklist

### Priority 1: Gas & Collateral Funding (User Action)
- [ ] **Acquire Somnia Test Tokens (STT):**
  - Visit the official faucet at [testnet.somnia.network](https://testnet.somnia.network) or request in `#dev-chat` on [discord.gg/somnia](https://discord.gg/somnia).
  - STT is required to pay gas for contract deployments and on-chain write transactions.
- [ ] **Run tUSDC Faucet Drip:**
  - Once STT is in your wallet, run:
    ```bash
    npm run agent:faucet
    ```
  - This dispenses 10,000 testnet tUSDC collateral into your wallet.

### Priority 2: Deploy `PulseAudit.sol` to Somnia Shannon
- [ ] Deploy `packages/contracts/src/PulseAudit.sol` using Viem or Foundry to Somnia Shannon Testnet (`https://dream-rpc.somnia.network`, Chain ID `50312`).
- [ ] Copy the deployed contract address into `.env.local` as `NEXT_PUBLIC_AUDIT_CONTRACT=0x...`.

### Priority 3: End-to-End Walkthrough & Dry Run
- [ ] Terminal 1: Run `npm run dev:web` and test `/claims` and `/agent` in browser.
- [ ] Terminal 2: Run `npm run agent` and observe continuous 15s resting orders posted to DreamDEX.
- [ ] Confirm batch redemption signature and Explorer links work cleanly.

### Priority 4: Record Demo Video & Submit
- [ ] **Record 2.5-Minute Demo Video:**
  - 0:00–0:25: Show DreamDEX missing finalized markets & documentation warning.
  - 0:25–1:05: Pulse Capital Radar scanning and discovering unredeemed winnings + Oracle audit link.
  - 1:05–1:45: "Claim & Auto-Recycle" batch redemption confirming on Somnia Shannon Explorer.
  - 1:45–2:25: Quoting Terminal showing dual post-only limit buys, Black-Scholes pricing, and order book depth.
  - 2:25–2:50: Recharts calibration curve, Brier score badge, and on-chain decision proofs.
  - 2:50–3:00: Monorepo architecture slide and closing statement.
- [ ] **DoraHacks Submission:**
  - Submit repository link, video link, and project description before **September 8, 2026 23:30 IST**.

---

## 4. Key Reference Files

* [README.md](file:///home/divyansh/Development/Projects/pulse/README.md) — Master Protocol Specification & Hackathon Narrative
* [resources.md](file:///home/divyansh/Development/Projects/pulse/resources.md) — Faucets, Network Parameters & Contract Addresses
* [package.json](file:///home/divyansh/Development/Projects/pulse/package.json) — Monorepo Workspaces Configuration
* [apps/web/app/claims/page.tsx](file:///home/divyansh/Development/Projects/pulse/apps/web/app/claims/page.tsx) — Capital Radar UI
* [apps/web/app/agent/page.tsx](file:///home/divyansh/Development/Projects/pulse/apps/web/app/agent/page.tsx) — Quoting Terminal UI
* [packages/core/src/agent/quotingAgent.ts](file:///home/divyansh/Development/Projects/pulse/packages/core/src/agent/quotingAgent.ts) — Autonomous Market-Making Engine
* [packages/core/src/agent/fairValueModel.ts](file:///home/divyansh/Development/Projects/pulse/packages/core/src/agent/fairValueModel.ts) — Black-Scholes Digital Delta Engine
* [packages/contracts/src/PulseAudit.sol](file:///home/divyansh/Development/Projects/pulse/packages/contracts/src/PulseAudit.sol) — On-Chain Attestation Contract
