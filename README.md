# Pulse — Closed-Loop Liquidity & Capital Recycling Protocol

**Target:** Somnia × DreamDEX Event Contracts Hackathon (DoraHacks, Testnet Submission)  
**Track:** Open Track (DeFi / Event Contracts / Prediction Markets / Autonomous Agents)  
**Ecosystem Primitives:** Somnia Shannon Layer-1 (105k TPS, Sub-second Finality) × DreamDEX Event Contracts  
**Core SDK:** `@somnia-chain/markets-sdk@0.29.0` (Pinned & Verified)

---

## 1. Executive Summary & Protocol Vision

Short-window prediction markets (15-minute to hourly BTC/ETH Up/Down binary contracts) face a compounding, two-sided structural bottleneck:

1. **Dead Capital & The Indexer Blindspot:** When short-window event contracts finalize, DreamDEX's primary catalog (`loadMarkets()`) skips finalized markets entirely. Casual traders leave, their winning payouts vanish from standard frontend views, and substantial collateral sits stranded on-chain.
2. **Cold-Start Illiquidity & Inventory Risk:** Every newly rolled market window launches with an empty order book. Market makers face high toxic flow and inventory risk, leading to wide bid-ask spreads or zero counter-parties.

**Pulse** solves both problems simultaneously by introducing the **Capital Recycling Flywheel**:

```
                       PULSE CAPITAL RECYCLING FLYWHEEL
                       
        ┌─────────────────────────────────────────────────────────────┐
        │                 1. DISCOVER STRANDED CAPITAL                │
        │  • Scans raw binary markets (status: "Finalized")           │
        │  • Cryptographically audits payouts via Somnia Oracles      │
        └──────────────────────────────┬──────────────────────────────┘
                                       │
                                       ▼
        ┌─────────────────────────────────────────────────────────────┐
        │              2. THE "CLAIM & RECYCLE" FLYWHEEL              │
        │  • Single-tx batch redemption via redeemMany()              │
        │  • One-click deposit into Autonomous Quoting Vault          │
        └──────────────────────────────┬──────────────────────────────┘
                                       │
                                       ▼
        ┌─────────────────────────────────────────────────────────────┐
        │            3. ZERO-INVENTORY QUANTITATIVE QUOTING           │
        │  • Black-Scholes Digital Option Pricing: N(d2) via EWMA vol │
        │  • Avellaneda-Stoikov Inventory Skewing                     │
        │  • Pair-Minting: Dual postOnly buys capture the spread      │
        └──────────────────────────────┬──────────────────────────────┘
                                       │
                                       ▼
        ┌─────────────────────────────────────────────────────────────┐
        │             4. ON-CHAIN ATTESTATION & CALIBRATION           │
        │  • PulseAudit.sol: Cryptographic decision seal on Somnia L1 │
        │  • Live Brier Score calculation + Dynamic Spread Control    │
        └──────────────────────────────┴──────────────────────────────┘
```

Pulse unites end-user capital recovery with institutional-grade autonomous market making, creating a continuous, self-sustaining liquidity engine for DreamDEX.

---

## 2. System Architecture & Tech Stack

Pulse is architected as a modular TypeScript monorepo powered by **npm workspaces**:

```
pulse/
├── apps/
│   └── web/                         # Next.js 14+ App Router (Dashboard & Terminal)
│       ├── app/
│       │   ├── page.tsx             # Pulse Unified Terminal (Radar + Active Market)
│       │   ├── claims/page.tsx      # Capital Radar & Oracle Verification Engine
│       │   ├── agent/page.tsx       # Agent Telemetry, Order Book & Calibration
│       │   └── api/
│       │       ├── claims/route.ts  # GET: Scans finalized markets & claimable balances
│       │       ├── telemetry/route.ts # GET: Real-time agent status & Brier scores
│       │       └── agent-history/route.ts # GET: Prediction vs outcome log
│       ├── components/
│       │   ├── CapitalRadar.tsx     # Animated sweep scanning indexer blindspots
│       │   ├── ClaimRow.tsx         # Individual position with Oracle Audit link
│       │   ├── FlywheelAction.tsx   # "Claim All" vs "Claim & Auto-Recycle"
│       │   ├── TelemetryRibbon.tsx  # Live L1 TPS, Brier Score, and Volatility
│       │   ├── OrderBookDepth.tsx   # Visual depth showing Pulse resting orders
│       │   └── CalibrationChart.tsx # Recharts empirical calibration scatter & diagonal
│       └── lib/
│           └── wagmiConfig.ts       # Somnia Shannon Testnet chain configuration
├── packages/
│   ├── contracts/                   # On-Chain Anchoring Layer (Somnia Shannon L1)
│   │   ├── src/
│   │   │   └── PulseAudit.sol       # Cryptographic state, hash & calibration seal
│   │   └── package.json
│   └── core/                        # Shared Protocol Logic (@pulse/core)
│       ├── src/
│       │   ├── client.ts            # Dual-tier SDK client & raw receipt unwrap
│       │   ├── oracle.ts            # Somnia Production Oracle audit graph linkers
│       │   ├── tracker/
│       │   │   └── redemptionTracker.ts # Direct finalized binary scanner & claimableFrom
│       │   ├── agent/
│       │   │   ├── quotingAgent.ts  # 15s execution loop with inventory skew
│       │   │   ├── fairValueModel.ts# Black-Scholes digital option pricing engine
│       │   │   └── audit.ts         # Somnia on-chain attestation dispatcher
│       │   └── analytics/
│       │       └── calibration.ts   # Brier score calculation & reliability binning
│       └── package.json
├── agent-worker/                    # Autonomous Quoting Daemon
│   ├── run.ts                       # Long-lived tsx process running the market-making loop
│   └── faucet-once.ts               # One-time testnet tUSDC bootstrap script
├── .env.example
├── package.json                     # Monorepo root workspace
└── README.md                        # Master build specification & documentation
```

### Core Technology Stack

| Layer | Choice | Rationale |
|---|---|---|
| **L1 Execution** | **Somnia Shannon Testnet** | Sub-second finality and 105k TPS enable low-latency quoting and continuous on-chain decision attestation. |
| **DEX / Protocol** | **DreamDEX Event Contracts** | Native order book CLOB for binary event contracts. |
| **SDK & Protocol Driver** | **`@somnia-chain/markets-sdk@0.29.0`** | Official DreamDEX SDK; pinned to `>=0.28.0` to eliminate float-to-tick rounding errors. |
| **On-Chain Attestation** | **Solidity (`PulseAudit.sol`)** | Seals agent decision hashes, predictions, and calibration scores directly onto Somnia L1. |
| **Frontend Framework** | **Next.js 14+ (App Router)** | High-performance server components for read-only indexer aggregation; client components for live wallet execution. |
| **Styling & Components** | **Tailwind CSS + shadcn/ui** | Clean, accessible institutional-terminal aesthetic. |
| **Data Visualization** | **Recharts** | Renders reliability diagrams (empirical frequency vs. forecast probability) and order book depth. |
| **Wallet Interaction** | **wagmi + viem + RainbowKit** | Seamless end-user wallet connection with native Somnia Shannon RPC support. |
| **Persistence (Worker)** | **better-sqlite3** | Lightweight, high-throughput local SQLite store for real-time Brier score tracking and execution auditing. |

---

## 3. Protocol Engineering & SDK Hardening (Critical Gotchas)

Pulse was built and verified against the actual runtime behavior of `@somnia-chain/markets-sdk@0.29.0`. The codebase explicitly resolves 5 documented platform traps:

1. **The Finalized Market Blindspot:**  
   DreamDEX’s standard catalog method (`exchange.loadMarkets()`) intentionally filters out settled markets. Relying on it yields an empty claimable list. Pulse bypasses this by querying `exchange.client.listBinaryMarkets({ status: "Finalized", limit: 200 })` directly.
2. **On-Chain State Lag Discrepancy:**  
   The DreamDEX REST indexer (`stg.api.dreamdex.io/v0`) can lag the live blockchain state by 1–3 seconds. Pulse never submits orders based solely on indexer state; it re-confirms live status via `exchange.client.getMarketOnchain(marketId)` (confirming `status === 1` for Trading, or `status === 3` for Finalized).
3. **Receipt Unwrapping on Unified Verbs:**  
   The unified `createOrder()` verb returns an object where `order.receipt` is `undefined`. Pulse correctly unwraps the receipt via `(order.info as PlaceOrderResult).receipt` and explicitly inspects `receipt.status === "reverted"`.
4. **Shared Pool Recycling & Data Isolation:**  
   DreamDEX recycles pool contracts across 100+ sequential 15-minute market windows. Querying trade history without time scoping contaminates data across unrelated markets. Pulse strictly bounds all historical candles and fills to `[m.tradingStart, m.expiry]`.
5. **Dynamic Scale Factor (Testnet vs. Mainnet):**  
   Testnet collateral (`tUSDC`) uses 6 decimals (`0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E`), whereas Somnia Mainnet collateral (`USDso`) uses 18 decimals. Pulse never hardcodes `1e6`; it dynamically reads `decimals()` from the ERC-20 token contract.

---

## 4. Feature 1: Capital Radar & Settlement Engine

### The Problem
Traders participate in 15-minute BTC/ETH event contracts, close their browser, and forget to redeem winnings. Because DreamDEX drops finalized markets from its active UI, user capital becomes trapped on-chain, draining overall ecosystem velocity.

### Implementation Details
* **Discovery Loop:** Queries `listBinaryMarkets({ status: "Finalized" })` and checks `exchange.client.getOutcomeBalances(userAddress, marketAddress)`.
* **Settlement Math:** Uses the SDK's battle-tested `claimableFrom()` function to compute exact payouts, respecting voided markets (50% refund) vs. resolved markets (100% payout).
* **Cryptographic Verification:** Every claimable row generates a direct audit link to the official Somnia Oracle visualizer:  
  `https://prd.oracle.somnia.host/questions/{oracleQuestionId}?view=graph`
* **Batch Execution:** Submits atomic batch redemptions via `exchange.trader.redeemMany(positions)`, minimizing user gas overhead and transaction fatigue.

---

## 5. Feature 2: Autonomous Quoting Agent & Quantitative Engine

### 1. Zero-Starting-Inventory Mechanic
Pulse exploits DreamDEX’s internal pair-minting architecture:
* When two opposite limit buy orders (one for `UP`, one for `DOWN`) cross or fill against incoming takers, the contract combines the collateral to **mint a new outcome pair**.
* The market-making agent does not need pre-funded token inventory of both outcomes. It posts resting limit buys on both sides:
  $$\text{Bid}_{\text{Up}} = P(\text{Up}) - \text{HalfSpread}$$
  $$\text{Bid}_{\text{Down}} = (1 - P(\text{Up})) - \text{HalfSpread}$$
* When both legs fill, the agent captures $2 \times \text{HalfSpread}$ risk-free.

### 2. Analytical Black-Scholes Digital Option Pricing
Unlike naive bots that mirror the mid-price, Pulse computes the exact theoretical fair value of a binary event contract using the Black-Scholes cash-or-nothing digital call formula:

$$P(\text{Up}) = \mathcal{N}(d_2) = \mathcal{N}\left(\frac{\ln(S / K) + (r - \frac{1}{2}\sigma^2)\tau}{\sigma\sqrt{\tau}}\right)$$

Where:
* $S$ = Current spot price fetched from oracle/candles.
* $K$ = Strike price at market inception.
* $\tau$ = Time remaining to settlement in annualized units $\left(\frac{\text{expiry} - \text{now}}{31{,}536{,}000}\right)$.
* $\sigma$ = Rolling short-window EWMA volatility calculated across recent candles.
* $\mathcal{N}(\cdot)$ = Standard cumulative normal distribution function.

### 3. Avellaneda-Stoikov Inventory Skewing
To prevent toxic flow and adverse selection (e.g., holding unhedged directional inventory when a sudden price spike fills only one leg), Pulse dynamically skews its reservation price:
* If the `UP` leg fills without a corresponding `DOWN` fill, Pulse immediately increases its `DOWN` bid price to attract takers and complete the pair before the 300-second lock window:
  $$\text{Bid}_{\text{Down}} = \text{Bid}_{\text{Down}} + \Delta_{\text{skew}}$$
  $$\text{Bid}_{\text{Up}} = \text{Bid}_{\text{Up}} - \Delta_{\text{penalty}}$$
* Enforces a strict pre-expiry cutoff: if `expiry - now < 300`, all resting quotes are cancelled to eliminate settlement tail risk.

---

## 6. Feature 3: On-Chain Attestation & Calibration Telemetry

### 1. `PulseAudit.sol` (Somnia Shannon Smart Contract)
Every decision made by the agent is cryptographically hashed and permanently recorded on Somnia Shannon L1 before market expiry:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PulseAudit {
    struct DecisionProof {
        bytes32 marketId;
        uint64 timestamp;
        uint16 predictedProbBps; // 6420 = 64.20%
        uint16 brierScoreBps;    // Rolling Brier Score
        bytes32 decisionHash;    // SHA-256 of (orderParams, spotPrice, volatility)
    }

    event QuotingProofRecorded(bytes32 indexed marketId, address indexed agent, uint16 predictedProbBps, bytes32 decisionHash);
    mapping(bytes32 => DecisionProof) public proofs;

    function recordDecision(
        bytes32 marketId,
        uint16 predictedProbBps,
        uint16 brierScoreBps,
        bytes32 decisionHash
    ) external {
        proofs[marketId] = DecisionProof(marketId, uint64(block.timestamp), predictedProbBps, brierScoreBps, decisionHash);
        emit QuotingProofRecorded(marketId, msg.sender, predictedProbBps, decisionHash);
    }
}
```

### 2. Statistical Calibration & The Brier Score
Pulse continuously evaluates its own predictive accuracy across settled markets using the **Brier Score**:

$$\text{Brier} = \frac{1}{N} \sum_{t=1}^N (f_t - o_t)^2$$

Where $f_t \in [0, 1]$ is the predicted probability and $o_t \in \{0, 1\}$ is the actual settlement outcome.
* **Calibration-Conditioned Execution:** If the rolling Brier score degrades ($>0.20$), the agent automatically widens its quoted spread to protect capital.
* **Reliability Diagram:** The dashboard renders an interactive Recharts curve comparing predicted probability deciles against empirical win frequencies. Perfect calibration sits on the $45^\circ$ diagonal.

---

## 7. The "One-Click Claim & Auto-Recycle" Flow

Pulse bridges consumer capital recovery with market-making liquidity via the **Auto-Recycle Flow**:

```
[ User Connects Wallet ]
        │
        ▼
[ Capital Radar: 450.00 tUSDC Stranded Winnings Discovered ]
        │
        ├─────────────────────────────────────────┐
        ▼                                         ▼
[ Option A: Claim All to Wallet ]       [ Option B: Claim & Auto-Recycle ]
  • Calls redeemMany()                    • Calls redeemMany()
  • Capital returns to idle wallet        • Immediately funds Quoting Agent
                                          • Starts earning bid-ask spread on next window
```

This transforms retail users from passive speculators into liquidity providers who earn the spread without technical overhead.

---

## 8. Setup & Running Locally

### Prerequisites
* Node.js `>=18.x`
* npm `>=9.x`
* Git

### Installation
```bash
# Clone repository
git clone https://github.com/divyansh-v15-06/pulse.git
cd pulse

# Install dependencies across all workspaces
npm install

# Configure environment
cp .env.example .env.local
```

### Environment Configuration (`.env.local`)
```env
NETWORK=testnet
AGENT_PRIVATE_KEY=0x...          # Funded via exchange.trader.faucet()
NEXT_PUBLIC_CHAIN_ID=50312       # Somnia Shannon Testnet
NEXT_PUBLIC_INDEXER_URL=https://stg.api.dreamdex.io/v0
NEXT_PUBLIC_RPC_URL=https://dream-rpc.somnia.network
NEXT_PUBLIC_WS_RPC=wss://dream-rpc.somnia.network/ws
NEXT_PUBLIC_AUDIT_CONTRACT=0x... # Deployed PulseAudit.sol address
AGENT_HALF_SPREAD=0.02
AGENT_SIZE_PER_SIDE=5
AGENT_INTERVAL_MS=15000
```

### Execution
```bash
# 1. Fund the agent wallet on Somnia Testnet (one-time)
npx tsx agent-worker/faucet-once.ts

# 2. Terminal 1: Launch the Next.js Terminal
npm run dev --workspace=apps/web

# 3. Terminal 2: Launch the Autonomous Quoting Agent Worker
npx tsx agent-worker/run.ts
```

---

## 9. Comprehensive Correctness Checklist

- [x] **SDK Pinned:** Pin `@somnia-chain/markets-sdk` to `0.29.0` (eliminates tick-grid rounding bugs).
- [x] **On-Chain Pre-Flight:** Live `getMarketOnchain(marketId)` status checked before every write.
- [x] **Safe Receipt Handling:** Reads `(order.info as PlaceOrderResult).receipt`, never `order.receipt`.
- [x] **Revert Verification:** Explicit inspection of `receipt.status === "reverted"`.
- [x] **Indexer Bypass:** Claims resolved via `listBinaryMarkets({ status: "Finalized" })`, never `loadMarkets()`.
- [x] **Cross Protection:** Catches `PostOnlyWouldCross` errors gracefully without crashing the loop.
- [x] **Dynamic Scaling:** Collateral decimals queried dynamically via `decimals()` (handles testnet 6 vs mainnet 18).
- [x] **Pool Isolation:** Historical candles and fills bounded to `[tradingStart, expiry]` to prevent recycled pool data contamination.
- [x] **Payout Precision:** Voided (50%) vs. Resolved (100%) payouts derived from `claimableFrom()`.
- [x] **Oracle Integration:** Somnia Production Oracle graph links integrated directly into claim rows.
- [x] **On-Chain Audit:** State decision hashes attested to `PulseAudit.sol` on Somnia Shannon.

---

## 10. Hackathon Submission & Pitch Assets

* **DoraHacks Project Name:** Pulse
* **Tagline:** The Closed-Loop Liquidity & Capital Recycling Protocol for DreamDEX Event Contracts on Somnia.
* **Target Video Structure (2.5 Minutes):**
  1. **0:00 – 0:25 (The Burning Problem):** Expose DreamDEX’s indexer blindspot where finalized markets disappear, leaving user capital stranded.
  2. **0:25 – 1:05 (The Capital Radar & Oracle Proof):** Connect wallet, sweep 200 markets, discover unredeemed winnings, and click the Somnia Oracle graph to prove settlement authenticity.
  3. **1:05 – 1:45 (The One-Click Auto-Recycle):** Trigger batch `redeemMany()` and route capital directly into the Quoting Agent pool.
  4. **1:45 – 2:25 (The Quoting Agent & Telemetry):** Show the agent placing dual `postOnly` limit buys using Black-Scholes pricing and Avellaneda-Stoikov inventory skewing. Show on-chain hashes on Somnia Explorer.
  5. **2:25 – 2:50 (Calibration & Brier Score):** Display the Recharts calibration curve, live Brier score, and dynamic spread modulation.
  6. **2:50 – 3:00 (Closing Vision):** Summarize Pulse as the essential liquidity and settlement infrastructure for the Somnia ecosystem.

---

## 11. Roadmap Beyond the Hackathon

* **Mainnet Deployment:** Seamless migration to Somnia Mainnet with native 18-decimal `USDso` collateral support.
* **EIP-4337 Session Key Automation:** Enable users to delegate automated claiming and reinvestment permissions to an on-chain smart account.
* **Multi-Asset Volatility Surface:** Expand beyond BTC/ETH to multi-asset prediction indices and cross-market statistical arbitrage.
* **Institutional MM Vaults:** ERC-4626 compliant shared vaults allowing external LPs to deposit collateral and share market-making yields.
