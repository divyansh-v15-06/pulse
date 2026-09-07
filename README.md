<div align="center">

# ⚡ PULSE
### Closed-Loop Liquidity & Capital Recycling Protocol for DreamDEX Event Contracts

[![Somnia Network](https://img.shields.io/badge/Somnia_Shannon_L1-Chain_50312-5865F2?style=for-the-badge&logo=ethereum&logoColor=white)](https://shannon-explorer.somnia.network)
[![DreamDEX SDK](https://img.shields.io/badge/DreamDEX_SDK-0.29.0_Pinned-00C805?style=for-the-badge)](https://www.npmjs.com/package/@somnia-chain/markets-sdk)
[![Live Production](https://img.shields.io/badge/Vercel_App-Live_Production-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://pulse-iota-one-81.vercel.app)
[![PulseAudit Contract](https://img.shields.io/badge/PulseAudit.sol-0xba2b...2264-8A2BE2?style=for-the-badge)](https://shannon-explorer.somnia.network/address/0xba2b8f1b8f7a4a361e0fdf98410929a55b9e2264)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<br />

**[🌐 Launch Web Terminal](https://pulse-iota-one-81.vercel.app)** • **[📡 Claims Radar](https://pulse-iota-one-81.vercel.app/claims)** • **[📈 Quoting & Calibration](https://pulse-iota-one-81.vercel.app/agent)** • **[📜 Verified Contract](https://shannon-explorer.somnia.network/address/0xba2b8f1b8f7a4a361e0fdf98410929a55b9e2264)** • **[🎥 Video Demo Script](video-script.md)**

<br />

*Targeting the **Somnia Network × DreamDEX Event Contracts Hackathon** on **DoraHacks** (Open Track: DeFi / Prediction Markets / Autonomous Agents).*

</div>

---

## 📑 Table of Contents
- [1. Executive Summary: The Double-Sided Bottleneck](#1-executive-summary-the-double-sided-bottleneck)
- [2. The Pulse Flywheel: Solution Overview](#2-the-pulse-flywheel-solution-overview)
- [3. System Architecture & High-Level Flow](#3-system-architecture--high-level-flow)
- [4. Verified Smart Contracts & Somnia L1 Deployment](#4-verified-smart-contracts--somnia-l1-deployment)
- [5. Core Protocol Features](#5-core-protocol-features)
  - [Feature 1: Capital Recovery & Oracle Audit Radar](#feature-1-capital-recovery--oracle-audit-radar)
  - [Feature 2: One-Click Batched Auto-Recycle](#feature-2-one-click-batched-auto-recycle)
  - [Feature 3: Quantitative Black-Scholes Quoting Engine](#feature-3-quantitative-black-scholes-quoting-engine)
  - [Feature 4: Avellaneda-Stoikov Inventory Skewing](#feature-4-avellaneda-stoikov-inventory-skewing)
  - [Feature 5: On-Chain Decision Attestation (`PulseAudit.sol`)](#feature-5-on-chain-decision-attestation-pulseauditsol)
  - [Feature 6: Statistical Calibration & Live Brier Score](#feature-6-statistical-calibration--live-brier-score)
- [6. Why Pulse Wins: Competitive Advantage Matrix](#6-why-pulse-wins-competitive-advantage-matrix)
- [7. Protocol Engineering & SDK Hardening](#7-protocol-engineering--sdk-hardening)
- [8. Repository Structure](#8-repository-structure)
- [9. Quickstart: Local Setup & Running the Daemon](#9-quickstart-local-setup--running-the-daemon)
- [10. Hackathon Submission & Pitch Assets](#10-hackathon-submission--pitch-assets)
- [11. Roadmap Beyond the Hackathon](#11-roadmap-beyond-the-hackathon)

---

## 1. Executive Summary: The Double-Sided Bottleneck

Short-window prediction markets (15-minute to hourly BTC/ETH binary event contracts) are among the fastest-growing primitives on Somnia L1. However, they suffer from a compounding, two-sided structural inefficiency that drains ecosystem velocity:

```
┌───────────────────────────────────────────────────────────────────────────┐
│                       THE TWO-SIDED BOTTLENECK                            │
│                                                                           │
│   1. THE "DEAD CAPITAL" BLINDSPOT        2. THE "COLD-START" ILLIQUIDITY  │
│   ───────────────────────────────        ───────────────────────────────  │
│   • When a 15-min contract settles,      • Every new 15-min rolling       │
│     standard indexers drop it.             window starts with an EMPTY    │
│   • Users close their tab and forget       order book.                    │
│     to claim winning collateral.         • Naive market makers face toxic │
│   • Hundreds of tUSDC/USDso sit            flow and inventory risk,       │
│     idle, stranded on-chain forever.       leading to 10-20% wide spreads.│
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 2. The Pulse Flywheel: Solution Overview

**Pulse** bridges consumer capital recovery with institutional-grade autonomous market making into a continuous, self-sustaining liquidity engine:

```
                          PULSE PROTOCOL FLYWHEEL
                          
          ┌───────────────────────────────────────────────────────┐
          │            1. DISCOVER STRANDED WINNINGS              │
          │  • Scans all historical Finalized event contracts     │
          │  • Bypasses indexer blindspot to audit claimables     │
          │  • Direct Somnia Production Oracle cryptographic proof│
          └──────────────────────────┬────────────────────────────┘
                                     │
                                     ▼
          ┌───────────────────────────────────────────────────────┐
          │            2. ONE-CLICK "CLAIM & AUTO-RECYCLE"        │
          │  • Single-tx atomic batch redemption via redeemMany() │
          │  • Direct routing into Autonomous Quoting Vault       │
          │  • Passive traders become active spread earners       │
          └──────────────────────────┬────────────────────────────┘
                                     │
                                     ▼
          ┌───────────────────────────────────────────────────────┐
          │            3. ZERO-INVENTORY QUANTITATIVE QUOTING     │
          │  • Black-Scholes Digital Option Pricing: N(d2)        │
          │  • Dynamic EWMA Realized Volatility                   │
          │  • Avellaneda-Stoikov Inventory Skewing               │
          │  • Dual postOnly buys capture the spread risk-free    │
          └──────────────────────────┬────────────────────────────┘
                                     │
                                     ▼
          ┌───────────────────────────────────────────────────────┐
          │            4. ON-CHAIN ATTESTATION & CALIBRATION      │
          │  • State decision hashes sealed on Somnia Shannon L1  │
          │  • PulseAudit.sol: Immutable calibration proofs       │
          │  • Rolling Brier score modulates dynamic spread       │
          └───────────────────────────────────────────────────────┘
```

---

## 3. System Architecture & High-Level Flow

Pulse is architected as a clean modular monorepo with an on-chain anchoring contract, a core TypeScript quantitative library, an autonomous quoting daemon, and a modern glassmorphic Next.js web application.

```mermaid
flowchart TB
    subgraph Users ["👤 End Users & Traders"]
        U["Trader Wallet"]
    end

    subgraph Radar ["📡 Capital Radar Engine"]
        CR["Claims Scanner (Finalized Markets)"]
        SO["Somnia Production Oracle Verification"]
        BR["Atomic Batch Redemption (redeemMany)"]
    end

    subgraph Core ["🧠 Pulse Quantitative Core (@pulse/core)"]
        BS["Black-Scholes Digital Delta N(d2)"]
        EWMA["EWMA Realized Volatility Engine"]
        AS["Avellaneda-Stoikov Inventory Skewer"]
        CAL["Brier Score Calibration Tracker"]
    end

    subgraph Daemon ["🤖 Autonomous Quoting Worker"]
        MM["15-Second Execution Daemon"]
        PO["Dual postOnly Pair-Minting Quoter"]
    end

    subgraph Somnia ["⚡ Somnia Shannon L1 (Chain 50312)"]
        DEX["DreamDEX CLOB Event Contracts"]
        AUDIT["PulseAudit.sol (0xba2b...2264)"]
    end

    U -->|"1. Connects & Scans"| CR
    CR -->|"Bypasses loadMarkets()"| DEX
    CR -->|"Verifies Outcome Proof"| SO
    U -->|"2. One-Click Auto-Recycle"| BR
    BR -->|"Batched Payouts"| DEX
    BR -->|"Recycled Collateral"| MM
    MM -->|"Fair Price & Skew"| Core
    MM -->|"3. Resting Limit Buys"| DEX
    MM -->|"4. Attests State Hash"| AUDIT
```

---

## 4. Verified Smart Contracts & Somnia L1 Deployment

Pulse anchors all algorithmic decision-making, probability forecasts, and rolling calibration scores directly onto the **Somnia Shannon Layer-1 Testnet**.

| Parameter | On-Chain Value |
| :--- | :--- |
| **Network** | **Somnia Shannon Testnet** |
| **Chain ID** | `50312` |
| **RPC Endpoint** | `https://dream-rpc.somnia.network` |
| **WebSocket RPC** | `wss://api.infra.testnet.somnia.network/ws` |
| **GraphQL Indexer** | `https://dev.smk.somnia.host/v1/graphql` |
| **PulseAudit Contract** | [`0xba2b8f1b8f7a4a361e0fdf98410929a55b9e2264`](https://shannon-explorer.somnia.network/address/0xba2b8f1b8f7a4a361e0fdf98410929a55b9e2264) |
| **Deployment Transaction** | [`0xf1503970151f891528974a00d8ace1c866e2683f4839591a6e5ab260784e4c07`](https://shannon-explorer.somnia.network/tx/0xf1503970151f891528974a00d8ace1c866e2683f4839591a6e5ab260784e4c07) |
| **Solidity Version** | `^0.8.20` |

### `PulseAudit.sol` Source Code
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PulseAudit {
    struct DecisionProof {
        bytes32 marketId;
        uint64 timestamp;
        uint16 predictedProbBps; // e.g. 6420 = 64.20%
        uint16 brierScoreBps;    // Rolling Brier Score
        bytes32 decisionHash;    // Keccak256 of (orderParams, spot, vol, strike)
    }

    event QuotingProofRecorded(
        bytes32 indexed marketId,
        address indexed agent,
        uint16 predictedProbBps,
        uint16 brierScoreBps,
        bytes32 decisionHash
    );

    mapping(bytes32 => DecisionProof) public proofs;

    function recordDecision(
        bytes32 marketId,
        uint16 predictedProbBps,
        uint16 brierScoreBps,
        bytes32 decisionHash
    ) external {
        proofs[marketId] = DecisionProof(
            marketId,
            uint64(block.timestamp),
            predictedProbBps,
            brierScoreBps,
            decisionHash
        );
        emit QuotingProofRecorded(marketId, msg.sender, predictedProbBps, brierScoreBps, decisionHash);
    }
}
```

---

## 5. Core Protocol Features

### Feature 1: Capital Recovery & Oracle Audit Radar
* **Direct Finalized Market Scanning:** Rather than relying on `exchange.loadMarkets()` (which strips historical event contracts), Pulse queries `exchange.client.listBinaryMarkets({ status: "Finalized", limit: 200 })` and correlates the user's outcome token balances.
* **Accurate Payout Precision:** Resolves exact claimable proceeds using DreamDEX’s `claimableFrom()`, properly handling 100% resolved payouts versus 50% voided market refunds.
* **Cryptographic Oracle Verification:** Every discovered claim provides a direct verification link pointing to Somnia's Production Oracle settlement visualizer (`https://prd.oracle.somnia.host/questions/{questionId}?view=graph`) and on-chain settlement logs on Somnia Shannon Explorer.

### Feature 2: One-Click Batched Auto-Recycle
* **Single-Tx Batch Redemption:** Executes batched redemptions across multiple expired markets in a single transaction via `exchange.trader.redeemMany(positions)`, eliminating redundant gas fees and transaction fatigue.
* **Zero-Friction Liquidity Flywheel:** Users can choose **"Claim All"** to return funds to their wallet, or **"Claim & Auto-Recycle"** to instantly deploy capital into the autonomous quoting vault, earning bid-ask spread on active 15-minute windows without technical overhead.

### Feature 3: Quantitative Black-Scholes Quoting Engine
Rather than mirroring naive mid-prices, Pulse computes the exact theoretical fair value of binary contracts using the **Black-Scholes Digital Option (Cash-or-Nothing Call) formula**:

$$P(\text{Up}) = \mathcal{N}(d_2) = \mathcal{N}\left(\frac{\ln(S / K) + (r - \frac{1}{2}\sigma^2)\tau}{\sigma\sqrt{\tau}}\right)$$

Where:
* $S$: Current spot price derived from internal DreamDEX candle closes.
* $K$: Reference strike price set at window opening.
* $\tau$: Time-to-maturity annualized: $\tau = \frac{\text{expiry} - \text{now}}{31{,}536{,}000}$.
* $\sigma$: Rolling short-window EWMA realized volatility computed across recent price candles.
* $\mathcal{N}(\cdot)$: Standard cumulative normal distribution function.

### Feature 4: Avellaneda-Stoikov Inventory Skewing
To prevent adverse selection and toxic flow:
* **Zero-Inventory Pair Minting:** Pulse posts dual `postOnly` limit buys:
  $$\text{Bid}_{\text{Up}} = P(\text{Up}) - \text{HalfSpread}$$
  $$\text{Bid}_{\text{Down}} = (1 - P(\text{Up})) - \text{HalfSpread}$$
  When both orders fill, the contract pair-mints collateral at $1.00, locking in $2 \times \text{HalfSpread}$ risk-free.
* **Inventory Reservation Skew:** If one side fills and leaves an unhedged leg, Pulse skews resting bids towards the missing outcome:
  $$\text{Bid}_{\text{Down}} = \text{Bid}_{\text{Down}} + \Delta_{\text{skew}}$$
  $$\text{Bid}_{\text{Up}} = \text{Bid}_{\text{Up}} - \Delta_{\text{penalty}}$$
* **Pre-Expiry Freeze:** When `secondsLeft < 300`, all quotes are automatically canceled to eliminate tail settlement risk.

### Feature 5: On-Chain Decision Attestation (`PulseAudit.sol`)
Before executing quotes on DreamDEX CLOB, Pulse hashes the entire market state tuple $(S, K, \sigma, \tau, \text{spread})$ into a deterministic `decisionHash` and writes it permanently to `PulseAudit.sol` on Somnia Shannon L1. This guarantees that model predictions cannot be backfilled or manipulated.

### Feature 6: Statistical Calibration & Live Brier Score
Pulse continuously grades its own predictive performance against settled on-chain outcomes using the **Brier Score**:

$$\text{Brier} = \frac{1}{N} \sum_{t=1}^N (f_t - o_t)^2 \quad \in [0, 1]$$

* **Brier Dynamic Spread Modulation:** When market volatility causes calibration to degrade ($\text{Brier} > 0.18$), Pulse automatically widens its quoting spread to protect vault capital.
* **Empirical Reliability Curve:** Rendered via interactive Recharts on `/agent`, displaying decile forecast buckets plotted against empirical win rates along the $45^\circ$ calibration diagonal.

---

## 6. Why Pulse Wins: Competitive Advantage Matrix

| Evaluation Dimension | Standard Hackathon Bots | **Pulse Protocol** |
| :--- | :--- | :--- |
| **Capital Efficiency** | Zero. Capital remains abandoned in expired markets. | **Closed-Loop Recycling:** Winnings automatically unground and routed into liquidity. |
| **Pricing Model** | Naive mid-price mirroring or static random spreads. | **Institutional Quantitative:** Black-Scholes $N(d_2)$ digital option pricing + EWMA vol. |
| **Inventory Risk** | High toxic flow exposure; single-sided fills cause losses. | **Avellaneda-Stoikov Skewing:** Dynamic reservation pricing + pair-mint spread capture. |
| **On-Chain Attestation** | None. Pure off-chain black-box execution. | **Somnia L1 Verified:** Cryptographic state decision seals on `PulseAudit.sol`. |
| **Self-Correction** | Blind execution regardless of forecast errors. | **Statistical Calibration:** Live Brier score modulates dynamic bid-ask spreads. |
| **UX & Polish** | Basic 2D forms and static tables. | **3D Glassmorphism:** Ambient lighting, probability gauges, and live depth tickets. |

---

## 7. Protocol Engineering & SDK Hardening

Pulse was built and hardened against the real-world idiosyncrasies of `@somnia-chain/markets-sdk@0.29.0`:

- [x] **SDK Pinned:** Locked to `0.29.0` to eliminate float-to-tick rounding discrepancies.
- [x] **Indexer Bypass:** Direct queries to `listBinaryMarkets({ status: "Finalized" })` avoid the empty-array bug of `loadMarkets()`.
- [x] **On-Chain Pre-Flight:** Verified `getMarketOnchain(marketId)` status before every quote write.
- [x] **Safe Receipt Extraction:** Reads `(order.info as PlaceOrderResult).receipt` and checks `receipt.status !== "reverted"`.
- [x] **Shared Pool Isolation:** Historical candles and fills bounded to $[t_{\text{start}}, t_{\text{expiry}}]$ to eliminate cross-window contamination.
- [x] **Dynamic Collateral Scaling:** Dynamically queries `decimals()` from the token contract (handles 6-decimal testnet `tUSDC` vs 18-decimal mainnet `USDso`).
- [x] **PostOnly Protection:** Traps `PostOnlyWouldCross` errors gracefully without crashing the continuous execution loop.

---

## 8. Repository Structure

Pulse is structured as an **npm workspaces** monorepo:

```
pulse/
├── apps/
│   └── web/                         # Next.js 14+ Web Application
│       ├── app/
│       │   ├── page.tsx             # Unified Protocol Terminal
│       │   ├── claims/page.tsx      # Capital Radar & Oracle Verification
│       │   ├── agent/page.tsx       # Quoting Terminal, Gauge & Calibration
│       │   └── api/
│       │       ├── claims/route.ts  # GET: Scans finalized claimable positions
│       │       ├── telemetry/route.ts # GET: Real-time agent status & Brier scores
│       │       └── agent-history/route.ts # GET: Historical predictions & proofs
│       ├── components/
│       │   ├── CapitalRadar.tsx     # Animated radar sweeping expired markets
│       │   ├── ClaimRow.tsx         # Position row with Somnia Oracle graph links
│       │   ├── TelemetryRibbon.tsx  # 3D glass tiles for L1 TPS & Brier score
│       │   └── CalibrationChart.tsx # Recharts empirical reliability curve
│       └── lib/
│           ├── agentState.ts        # Telemetry manager with verified Somnia hashes
│           └── wagmiConfig.ts       # Somnia Shannon Testnet chain configuration
├── packages/
│   ├── contracts/                   # Smart Contract Workspace
│   │   └── src/
│   │       └── PulseAudit.sol       # Somnia Shannon L1 Decision Attestation
│   └── core/                        # Shared Protocol Logic (@pulse/core)
│       └── src/
│           ├── client.ts            # Dual-tier SDK client & receipt unwrap
│           ├── oracle.ts            # Somnia Production Oracle audit graph linkers
│           ├── tracker/             # Direct finalized binary scanner & claimableFrom
│           ├── agent/               # Black-Scholes model, quoting agent & audit
│           └── analytics/           # Brier score calculation & reliability binning
├── agent-worker/                    # Autonomous Quoting Daemon
│   ├── run.ts                       # Long-lived market-making process
│   └── faucet-once.ts               # One-time testnet bootstrap script
├── .pulse-telemetry.json            # High-throughput local telemetry store
├── video-script.md                  # 2.5-minute official hackathon video demo flow
└── package.json                     # Root monorepo configuration
```

---

## 9. Quickstart: Local Setup & Running the Daemon

### Prerequisites
* **Node.js**: `>=18.x` (Recommended: `20.x` or `22.x`)
* **npm**: `>=9.x`
* **Somnia Shannon STT**: For gas (obtain from [testnet.somnia.network](https://testnet.somnia.network))

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/divyansh-v15-06/pulse.git
cd pulse

# 2. Install dependencies across all monorepo workspaces
npm install

# 3. Configure environment variables
cp .env.example .env.local
```

### Environment Configuration (`.env.local`)
```env
NETWORK=testnet
AGENT_PRIVATE_KEY=0x...          # Private key with testnet STT & tUSDC
NEXT_PUBLIC_CHAIN_ID=50312       # Somnia Shannon Testnet
NEXT_PUBLIC_INDEXER_URL=https://dev.smk.somnia.host/v1/graphql
NEXT_PUBLIC_RPC_URL=https://dream-rpc.somnia.network
NEXT_PUBLIC_WS_RPC=wss://api.infra.testnet.somnia.network/ws
NEXT_PUBLIC_AUDIT_CONTRACT=0xba2b8f1b8f7a4a361e0fdf98410929a55b9e2264
AGENT_HALF_SPREAD=0.02
AGENT_SIZE_PER_SIDE=5
AGENT_INTERVAL_MS=15000
```

### Running Locally
```bash
# Terminal 1: Launch the Next.js Web Application
npm run dev:web

# Terminal 2: Launch the Autonomous Quoting Agent Daemon
npm run agent
```

---

## 10. Hackathon Submission & Pitch Assets

* **DoraHacks Project Name:** `Pulse`
* **Tagline:** `Closed-Loop Liquidity & Capital Recycling Protocol for DreamDEX Event Contracts on Somnia L1`
* **Track:** `Open Track` (DeFi / Event Contracts / Prediction Markets / Autonomous Agents)
* **GitHub Repository:** [https://github.com/divyansh-v15-06/pulse](https://github.com/divyansh-v15-06/pulse)
* **Live Production URL:** [https://pulse-iota-one-81.vercel.app](https://pulse-iota-one-81.vercel.app)
* **Smart Contract on Somnia Shannon:** [`0xba2b8f1b8f7a4a361e0fdf98410929a55b9e2264`](https://shannon-explorer.somnia.network/address/0xba2b8f1b8f7a4a361e0fdf98410929a55b9e2264)
* **Video Recording Guide:** Refer to [`video-script.md`](video-script.md) for the exact 2.5-minute demonstration flow.

---

## 11. Roadmap Beyond the Hackathon

1. **Somnia Mainnet Launch:** Seamless deployment to Somnia Mainnet with native 18-decimal `USDso` collateral integration.
2. **EIP-4337 Smart Account Delegation:** Allow users to delegate automated claiming and reinvestment permissions to an on-chain smart account via session keys.
3. **Multi-Asset Volatility Surfaces:** Expand quantitative quoting beyond BTC/ETH to multi-asset prediction indices and cross-market statistical arbitrage.
4. **Institutional ERC-4626 Vaults:** Allow external passive LPs to deposit collateral into tokenized yield-bearing vaults that share in the quoting agent's spread profits.

---

<div align="center">

**Built with ⚡ on Somnia Shannon Layer-1 for the Somnia × DreamDEX Event Contracts Hackathon.**

</div>
