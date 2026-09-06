# Pulse — Build Specification

**For: an AI coding agent building this project end-to-end.**
**Target: Somnia × DreamDEX Event Contracts Hackathon (testnet submission).**
**Deadline context: submissions close 8 Sep. Build for a working testnet demo, not production hardening.**

This document is the single source of truth for what to build, how, and with
what tools. Follow it literally — every SDK method, field name, and gotcha
below has been verified against the real installed package
(`@somnia-chain/markets-sdk@0.29.0`), not inferred from docs alone. Where a
decision is still open, it's marked `[DECISION NEEDED]` — pick a reasonable
default and note it, don't block on it.

---

## 1. What this product is

**Pulse** is a web dashboard for DreamDEX Event Contracts (short-window,
auto-rolling BTC/ETH Up-or-Down binary markets on the Somnia testnet) with
two features:

1. **Claim Tracker** — finds and lets users redeem winnings from *settled*
   markets, including ones that no longer appear in the standard "active
   markets" list (a real, documented gap in the platform — see §6).
2. **Quoting Agent** — an autonomous bot that continuously quotes both sides
   of the current market window using a zero-starting-inventory mechanic,
   and a live calibration view showing whether its predictions are any good.

Both features share one connected wallet and one live market-data layer.

---

## 2. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Language | TypeScript (strict mode) everywhere | Type safety against the SDK's own types catches integration bugs before runtime |
| Frontend framework | **Next.js 14+ (App Router)** | Server + client components in one app; API routes double as the agent's control endpoints; fast to ship |
| Styling | **Tailwind CSS** + **shadcn/ui** | Fast, clean, accessible components without hand-rolling a design system |
| Charts | **Recharts** | Calibration chart (implied probability vs. realized outcome) and PnL-over-time chart |
| Chain interaction | **`@somnia-chain/markets-sdk@^0.28.0`** (installed & verified at `0.29.0`) + **`viem@^2.x`** | This IS the DreamDEX Event Contracts SDK — do not reimplement contract calls by hand except where the raw trader tier is explicitly needed |
| Wallet connect (user-facing) | **wagmi + viem + RainbowKit** (or ConnectKit) | Users need to connect their own wallet to see/claim their positions; the agent uses its own separate private key (see §3) |
| Agent runtime | **Node.js background worker**, run as a long-lived process (`tsx src/agent/run.ts`), separate from the Next.js web process | Keeps the quoting loop running independently of web traffic; simplest to demo as "look, it's running in this terminal" |
| Local persistence (agent history only) | **SQLite via `better-sqlite3`** (or a flat JSON file if time is short) | Only needed to store the agent's own predictions vs. outcomes over time for the calibration chart — everything else is read live from chain/indexer, no other DB needed |
| Env/config | `dotenv`, `.env.local` | Already scaffolded |
| Package manager | npm | Matches what's already installed |
| Deployment (optional, for demo polish) | Vercel (frontend) + Railway/Render (agent worker) | Not required for a testnet demo video, but nice if time allows |

**Do not introduce:** a full backend framework (Express/Fastify) — Next.js
API routes cover everything needed. Do not introduce a heavy ORM — the SQLite
usage here is a single small table.

---

## 3. Accounts & keys

Two distinct private keys, both testnet-only:

- **Agent wallet** — funded via the SDK's built-in faucet
  (`exchange.trader.faucet()`, capped at 10,000 tUSDC per call, no cooldown
  info confirmed — call it once at startup and check the balance before
  assuming more is needed). This wallet places the agent's quotes.
- **User wallet** — connected via the frontend wallet-connect flow (MetaMask
  etc., configured for Somnia testnet). This is whoever is using the
  dashboard to check/claim their own winnings. The Claim Tracker reads and
  redeems **on behalf of the connected wallet**, not the agent's wallet.

Never let the agent wallet's private key reach the frontend/browser bundle —
it lives only in the Node worker's environment.

---

## 4. Network & contract config

Somnia testnet, chain id per SDK's exported testnet chain object
(`somniaShannon` from `@somnia-chain/markets-sdk/chains`).

Core contracts (identical on testnet/mainnet via CREATE3 — do not hardcode
these yourself, use the SDK's exported constant):

```ts
import { SOMNIA_TESTNET_ADDRESSES } from "@somnia-chain/markets-sdk";
```

Collateral token: **tUSDC**, `0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E`,
**6 decimals** on testnet (mainnet USDso is 18 decimals — never hardcode a
scale constant, always read `decimals()` at runtime so the same code is safe
if ever pointed at mainnet).

Indexer URL (testnet): `https://stg.api.dreamdex.io/v0`
WS RPC (testnet): `wss://dream-rpc.somnia.network/ws`

`[DECISION NEEDED]`: confirm exact indexer/RPC URLs against the current
`docs.dreamdex.io/developers` pages at build time — these were the values in
the docs snapshot this spec was written from and may have changed.

---

## 5. Repo structure

```
pulse/
├── apps/
│   └── web/                     # Next.js app (dashboard + API routes)
│       ├── app/
│       │   ├── page.tsx                    # landing / connect wallet
│       │   ├── claims/page.tsx             # Claim Tracker UI
│       │   ├── agent/page.tsx              # Agent activity + calibration UI
│       │   └── api/
│       │       ├── claims/route.ts         # GET claimable positions for a wallet
│       │       ├── redeem/route.ts         # POST trigger redemption
│       │       └── agent-history/route.ts  # GET agent prediction history
│       ├── components/
│       │   ├── ClaimRow.tsx
│       │   ├── ClaimSummaryCard.tsx
│       │   ├── OracleAuditLink.tsx
│       │   ├── AgentStatusCard.tsx
│       │   └── CalibrationChart.tsx
│       └── lib/
│           └── wagmiConfig.ts
├── packages/
│   └── core/                    # shared logic, importable by both web app and agent worker
│       ├── src/
│       │   ├── client.ts        # exchange builder, receipt unwrap, status/decimals helpers
│       │   ├── oracle.ts        # oracle audit URL helper
│       │   ├── tracker/
│       │   │   └── redemptionTracker.ts
│       │   ├── agent/
│       │   │   ├── quotingAgent.ts
│       │   │   └── fairValueModel.ts
│       │   └── analytics/
│       │       └── calibration.ts
│       └── package.json
├── agent-worker/
│   └── run.ts                   # long-running process: `tsx agent-worker/run.ts`
├── .env.example
├── package.json                 # workspace root (npm workspaces)
└── README.md                    # this file
```

Use **npm workspaces** to share `packages/core` between `apps/web` and
`agent-worker` without publishing it — both import from
`@pulse/core`.

---

## 6. Feature 1: Claim Tracker — full spec

### The bug this fixes (must understand before building)

DreamDEX's own docs state, verbatim, across three separate pages: the
standard way of finding your markets (`loadMarkets()`) **skips finalized
(settled) binary markets entirely**. A settled market simply isn't in that
list anymore. Any tool that scans "my markets" the obvious way will report
zero claimable winnings even when real winnings exist. The fix: query the
binary-market tier directly with `status: "Finalized"`.

### Data flow

1. User connects wallet on the frontend (wagmi).
2. Frontend calls `GET /api/claims?address=0x...`.
3. API route (server-side, using its own read-only SDK client — no private
   key needed for reads) calls the shared `findClaimablePositions()` function
   from `packages/core`.
4. That function:
   - `exchange.client.listBinaryMarkets({ status: "Finalized", limit: 200 })`
   - For each market, `exchange.client.getOutcomeBalances(account, marketAddress)`
     → skip if both `yes` and `no` balances are `0`
   - `exchange.client.getMarketFees(marketId)` → get `settlementFeeBps`
     (dreamDEX sets this to 0, but read it live, don't assume)
   - Build `ClaimableInput[]` (one entry per held outcome index) and pass to
     the SDK's own `claimableFrom()` helper (exported from
     `@somnia-chain/markets-sdk`) — **do not hand-roll this math**, the SDK
     already implements the Resolved-vs-Voided payout logic correctly.
   - For each resulting `ClaimablePosition`, attach:
     - `outcomeLabel`: `"Resolved — you won"` / `"Voided — 50% back"` (never
       show a losing position as claimable — `claimableFrom` already filters
       these out, but double check nothing with `amount: 0` renders)
     - `oracleAuditUrl`: `https://prd.oracle.somnia.host/questions/{oracleQuestionId}?view=graph`
       (only if `oracleQuestionId` is present on the market row)
5. Frontend renders one `ClaimRow` per claimable position, plus a summary
   card totaling claimable value across all of them.
6. "Claim All" button calls `POST /api/redeem` with the connected wallet's
   signer (client-side signing — the user signs the transaction themselves,
   the API route does NOT hold the user's key). Use `exchange.trader.redeemMany()`
   for the batched write.

### UI requirements

- Empty state: "No unclaimed winnings found" — should feel reassuring, not
  broken.
- Each row shows: asset (BTC/ETH), the market's window (from `intervalSec`/
  expiry, formatted human-readable — never parse the question text per
  gotcha #13), amount claimable, outcome label, and the oracle audit link as
  a small "Verify" link/icon.
- Loading state while scanning (this can take a few seconds across ~200
  markets — show a progress indicator, not a blank screen).
- After a successful claim, optimistically remove that row and show a success
  toast with the tx hash.

### Correctness rules (non-negotiable)

- Never call `loadMarkets()` for this feature. Always `listBinaryMarkets`
  with `status: "Finalized"`.
- Never infer "you won" by comparing prices yourself — use `claimableFrom`.
- A reverted redeem does not throw automatically on the raw trader tier —
  check `res.receipt?.status === "reverted"` explicitly after
  `redeemMany()`.

---

## 7. Feature 2: Quoting Agent — full spec

### What it does

Every `intervalMs` (default 15s), for every live, tradable binary market:

1. `exchange.loadMarkets(true)` → filter to `m.active && isBinaryMarket(m.info)`
2. Compute `secondsLeft = m.info.expiry - now`; skip if `< 300` (gotcha #9 —
   don't quote a market that's about to lock)
3. Re-confirm **live on-chain status** via
   `exchange.client.getMarketOnchain(marketId)`; only proceed if
   `status === 1` (Trading) — the indexed status lags (gotcha #1)
4. Read `m.outcomes[0].symbol` (Up) and `m.outcomes[1].symbol` (Down) — never
   construct these symbols by hand
5. `exchange.fetchOrderBook(upSymbol, 5)` → compute mid price if both a best
   bid and best ask exist
6. Feed `(symbol, mid)` into the fair-value model (§7.1) → get `fairUp`
7. Post two `postOnly` limit buy orders:
   - Buy Up at `fairUp - halfSpread`
   - Buy Down at `(1 - fairUp) - halfSpread`
   Both via `exchange.createOrder(symbol, "limit", "buy", size, price, { postOnly: true })`
8. **This needs zero starting inventory** — if both legs eventually fill
   against other opposite-side resting buys, the pool mints a fresh Up/Down
   pair from the combined collateral (the "mint-a-pair" path). No sell-side
   inventory needs to be pre-funded.
9. Unwrap every order's receipt via the shared `unwrapReceipt()` helper
   (`(order.info as PlaceOrderResult).receipt`) — never read `order.receipt`
   directly, it's always `undefined` on unified verbs.
10. Catch `PostOnlyWouldCross` errors and treat them as "requote next pass,"
    not a failure — this happens normally when the book moves between your
    read and your send.
11. Log every quote attempt + fill (if any) to the local SQLite table for
    the calibration view (§8).

### 7.1 Fair value model — `[DECISION NEEDED, pick one to start]`

Interface:
```ts
interface FairValueModel {
  estimate(marketSymbol: string, midPrice: number | undefined): number; // returns P(Up) in (0,1)
}
```

Two reasonable options, in increasing sophistication:

- **v1 (ship this first):** `midFollowingModel` — just return the current
  mid price, or `0.5` if no book exists yet. Trivial, always available,
  proves the plumbing works end-to-end.
- **v2 (if time allows):** a simple **momentum model** — pull the asset's
  recent short-term price change (e.g. from `fetchPriceCandles`, which reads
  an external price feed, or from the market's own recent trade tape via
  `fetchMyTrades`/`getFills`) and shade the probability slightly in the
  direction of recent momentum. This gives the calibration chart something
  more interesting to show than "we just copied the market."

Do not build anything more complex than v2 given the timeline — an ML model
is out of scope for this deadline.

### Important constraint discovered during scoping

The **unified** `createOrder` verb has **no parameter for a custom order
expiry** — it manages expiry internally. If a tighter, explicit dead-man's
switch expiry is required (per gotcha #5's general guidance), that requires
dropping to the **raw trader tier** (`exchange.trader.placeOrder(...)` with
an explicit `expireTimestampNs`) instead of the unified verb. For v1, using
the unified verb's default expiry is acceptable — note this tradeoff in the
demo/feedback report rather than over-engineering it before the deadline.

---

## 8. Calibration / analytics view

Purpose: show whether the agent's predictions are actually any good, and
give the dashboard a "proof of substance" visual beyond just "it's trading."

- Local SQLite table `agent_predictions`:
  `(market_id, asset, predicted_p_up, quoted_at, resolved_at NULLABLE, actual_outcome NULLABLE)`
- A background job (can be part of the same worker loop) periodically checks
  `exchange.client.listPastBinaryMarkets({ status: "Finalized" })` and
  `exchange.client.getMarketResolution(marketId)` for any market the agent
  quoted, fills in `actual_outcome` from `winningOutcome`/`voided`.
- `CalibrationChart` (Recharts scatter or binned bar chart): x-axis =
  predicted P(Up) bucket, y-axis = actual fraction that resolved Up. A
  perfectly calibrated model sits on the diagonal.
- Secondary simple stat: rolling win-rate / "quotes placed" counter for the
  demo to point at live.

Historical reads must scope `getCandles`/`getFills` to
`[m.tradingStart, m.expiry]` explicitly — a pool is recycled across 100+
markets, so an unscoped read blends unrelated windows together (this is a
documented, verified gotcha, not a hypothetical).

---

## 9. Environment variables (`.env.example`)

```
NETWORK=testnet
AGENT_PRIVATE_KEY=0x...          # separate wallet, testnet-only, funded via faucet()
NEXT_PUBLIC_CHAIN_ID=            # from somniaShannon chain object
NEXT_PUBLIC_INDEXER_URL=https://stg.api.dreamdex.io/v0
VENUE_ID=                        # confirm with organizers whether multi-venue applies; leave unset if single-venue
AGENT_HALF_SPREAD=0.02
AGENT_SIZE_PER_SIDE=5
AGENT_INTERVAL_MS=15000
```

---

## 10. Setup & run

```bash
npm install
cp .env.example .env.local        # fill in AGENT_PRIVATE_KEY

# one-time: fund the agent wallet on testnet
npx tsx agent-worker/faucet-once.ts

# terminal 1: the web dashboard
npm run dev --workspace=apps/web

# terminal 2: the trading agent (separate long-running process)
npx tsx agent-worker/run.ts
```

---

## 11. Correctness checklist (verified against the real SDK — do not skip any)

- [ ] SDK pinned to `^0.28.0` or newer (installed: `0.29.0`) — below this,
      float prices land off the tick grid and silently fail
- [ ] Every write reconfirms **live on-chain** market status before sending
- [ ] `order.info.receipt`, never `order.receipt`, checked for
      `status === "reverted"` on every write
- [ ] Claim Tracker uses `listBinaryMarkets({ status: "Finalized" })`, never
      `loadMarkets()`
- [ ] `PostOnlyWouldCross` caught and treated as "requote," not a crash
- [ ] Collateral scale derived from `decimals()`, never hardcoded (6 on
      testnet, 18 on mainnet)
- [ ] No market/pool address ever hardcoded or cached beyond one pass — always
      re-resolved from the registry/SDK, keyed by `marketId`, never by pool
      address
- [ ] History reads (`getCandles`/`getFills`) scoped to
      `[tradingStart, expiry]`
- [ ] UI text distinguishes Resolved (100% payout) from Voided (50% payout)
- [ ] Asset/interval labels come from typed fields (`asset`, `intervalSec`),
      never parsed from question text

---

## 12. Hackathon submission checklist

- [ ] Working prototype on testnet (this project)
- [ ] GitHub repository, public, with this README
- [ ] 2–3 minute demo video — suggested structure:
      1. State the bug (10s): "settled markets vanish from the normal list —
         here's DreamDEX's own docs warning about it"
      2. Show the Claim Tracker finding + claiming real unclaimed winnings (30s)
      3. Show the oracle audit link proving the settlement (15s)
      4. Show the agent quoting live, rolling to a new market window
         automatically (45s)
      5. Show the calibration chart (15s)
      6. Close with future vision (15s)
- [ ] *(Optional)* Presentation deck
- [ ] *(Optional)* Feedback report — good candidates to include: the
      `loadMarkets()`/Finalized gap (§6), the `order.receipt` vs
      `order.info.receipt` trap (§7 step 9), and the missing custom-expiry
      param on the unified `createOrder` verb (§7.1 closing note)

---

## 13. Explicitly out of scope for this deadline

- Mainnet deployment
- Any ML-based prediction model beyond a simple momentum heuristic
- Multi-venue support unless confirmed necessary (§4 decision needed)
- Mobile-responsive polish beyond "doesn't visibly break"
- User authentication beyond wallet connect
