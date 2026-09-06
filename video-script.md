# Pulse — DoraHacks Demo Video Script (2.5 Minutes)

**Target Hackathon:** Somnia × DreamDEX Event Contracts Hackathon (DoraHacks)  
**Total Target Duration:** 2:30 (150 seconds)  
**Submission Requirement:** High-definition screen recording with voiceover (Loom / YouTube / Vimeo).

---

## Preparation Checklist Before Recording

1. **Terminal 1:** Run Next.js web application:
   ```bash
   npm run dev:web
   ```
   Open `http://localhost:3000` in Google Chrome (dark mode recommended, 1920x1080 resolution).
2. **Terminal 2:** (Optional) Have the agent worker running or ready:
   ```bash
   npm run agent
   ```
3. **Wallet:** Connect MetaMask or Rainbow with Somnia Shannon Testnet (`Chain ID: 50312`).
4. **Tabs open:**
   - Tab 1: `http://localhost:3000` (Pulse Home)
   - Tab 2: `http://localhost:3000/claims` (Capital Radar)
   - Tab 3: `http://localhost:3000/agent` (Quoting Terminal)
   - Tab 4: `https://shannon-explorer.somnia.network` (Somnia Shannon Explorer)

---

## Scene-by-Scene Script & Action Timeline

### Scene 1: The Burning Problem (0:00 – 0:25)
* **Screen:** Start on Pulse Home (`http://localhost:3000`), scrolling smoothly over the "4-Step Capital Velocity Loop" architecture.
* **Voiceover:**
  > "Hi everyone, this is Pulse — the Closed-Loop Liquidity and Capital Recycling Protocol built for DreamDEX Event Contracts on Somnia Network.
  >
  > In short-window 15-minute prediction markets, settled contracts quickly drop out of standard frontend views. Casual traders leave, their winning payouts vanish from indexer catalogs, and millions in retail capital sit stranded on-chain. Meanwhile, every new market window launches with an empty order book and zero liquidity. This compounding bottleneck drains ecosystem velocity.
  >
  > Pulse solves both problems simultaneously."

---

### Scene 2: The Capital Radar & Somnia Oracle Proof (0:25 – 1:00)
* **Screen:** Navigate to `/claims` ("Capital Radar"). Connect wallet. Show the animated radar sweep scanning finalized contracts and discovering claimable positions. Click "Verify" on one row to open the Somnia Oracle visualizer graph.
* **Voiceover:**
  > "First, we introduce the **Capital Radar**.
  >
  > Standard interfaces miss finalized markets because `loadMarkets` intentionally skips them. Pulse bypasses this limitation by auditing the binary market tier directly on Somnia Shannon.
  >
  > As you can see, connecting our wallet instantly sweeps through historical markets and discovers stranded tUSDC winnings across settled BTC and ETH event contracts.
  >
  > To ensure 100% trustlessness, every claim row includes a direct verification link to the official Somnia Oracle visualizer graph, where users can inspect the cryptographic settlement proof and resolution answer on-chain."

---

### Scene 3: The "Claim & Auto-Recycle" Flywheel (1:00 – 1:35)
* **Screen:** Point cursor to the two buttons: "Claim to Wallet" vs. "Claim & Auto-Recycle". Click **"Claim & Auto-Recycle"**. Sign the batch redemption transaction in MetaMask (`redeemMany`). Show the confirmation hash on Somnia Shannon Explorer, and watch the page transition to the Quoting Terminal (`/agent`).
* **Voiceover:**
  > "Now, instead of letting reclaimed capital sit idle in a wallet, Pulse introduces the **Auto-Recycle Flywheel**.
  >
  > With a single click on **Claim & Auto-Recycle**, Pulse triggers an atomic batch redemption through DreamDEX's `redeemMany` contract method, and immediately funnels that capital into our autonomous market-making vault.
  >
  > In one smooth flow, retail users are transformed from passive speculators into liquidity providers who earn the bid-ask spread on the very next market window."

---

### Scene 4: Institutional Zero-Inventory Quoting (1:35 – 2:15)
* **Screen:** On `/agent` ("Quoting Terminal"). Highlight the Telemetry Ribbon (Pricing Engine, Dynamic Spread, Quotes Placed, Brier Calibration). Show the "Current Window" card with live resting bids.
* **Voiceover:**
  > "Here on the Quoting Terminal, our autonomous market-making daemon operates around the clock on Somnia Shannon L1.
  >
  > Pulse leverages DreamDEX's zero-starting-inventory pair-minting mechanic. By posting resting dual `postOnly` limit buys on both UP and DOWN, the protocol mints fresh outcome pairs whenever incoming takers cross our quotes, capturing the spread risk-free.
  >
  > Rather than relying on naive mid-price tracking, our pricing engine calculates the exact theoretical fair value using the closed-form **Black-Scholes digital option delta**: $P(\text{Up}) = \mathcal{N}(d_2)$, powered by rolling EWMA realized volatility and Avellaneda-Stoikov inventory skewing to protect against toxic order flow."

---

### Scene 5: Calibration Curve & Somnia L1 Attestation (2:15 – 2:40)
* **Screen:** Scroll down to the **Model Calibration Curve** (Recharts reliability diagram). Point to the 45° ideal diagonal vs. realized settlements. Show the **Decision Proofs** table and click an L1 transaction hash to show the proof on Somnia Shannon Block Explorer.
* **Voiceover:**
  > "Statistical accountability is built into the protocol's DNA.
  >
  > This reliability diagram compares predicted probability deciles against empirical win rates, tracking our live Brier score. If predictive accuracy degrades, our dynamic spread controller widens quoting spreads automatically to protect principal.
  >
  > Furthermore, every decision made by the agent is hashed via SHA-256 and permanently attested to `PulseAudit.sol` on Somnia Shannon L1 before market expiry. You can verify every single decision hash directly on the block explorer."

---

### Scene 6: Closing & Architecture (2:40 – 2:50)
* **Screen:** Return to the top of the terminal or landing page showing the unified Pulse brand and Somnia L1 badge.
* **Voiceover:**
  > "Pulse creates a self-sustaining, closed-loop liquidity engine: discovering dead capital, recycling it into active markets, and anchoring every decision to Somnia Layer-1.
  >
  > Pulse is built for Somnia, verified on Shannon testnet, and ready for mainnet. Thank you!"

---

## Pro-Tips for Recording
1. **Pacing:** Keep voiceover clear, steady, and energetic.
2. **Cursor Movement:** Use smooth, deliberate mouse movements; hover over key numbers (tUSDC balance, Brier score, Somnia Shannon badge) as you mention them.
3. **Resolution:** Record in 1080p 60fps using OBS Studio or Loom.
