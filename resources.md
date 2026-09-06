# Pulse — Resources & Setup Guide

This document outlines the testnet assets, network parameters, faucets, and API endpoints required to run and test **Pulse** locally and on the Somnia Shannon Testnet.

---

## 1. Required Tokens & Faucets

Pulse interacts with two distinct tokens on the Somnia Shannon Testnet:

### A. Somnia Test Token (STT) — Native Gas Token
* **Purpose:** Pays for blockchain gas when executing on-chain transactions:
  * Batch claiming winnings (`redeemMany()`)
  * ERC-20 approvals
  * Deploying and writing to `PulseAudit.sol`
* **Network Decimals:** 18
* **How to Obtain:**
  1. **Official Web Faucet:** Visit [testnet.somnia.network](https://testnet.somnia.network), connect your wallet, and solve the captcha.
  2. **Somnia Discord:** Join [discord.gg/somnia](https://discord.gg/somnia), navigate to `#dev-chat`, and request STT for your wallet address (tag `@emreyeth` if building for the hackathon).
  3. **Thirdweb / Community Faucet:** Search for Somnia Shannon testnet faucets on thirdweb.

---

### B. Test USDC (tUSDC) — Prediction Market Collateral
* **Purpose:** The collateral token required by DreamDEX Event Contracts to place buy orders, mint binary pairs, and receive settlement payouts.
* **Token Contract Address:** `0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E`
* **Network Decimals:** 6 (Testnet tUSDC is 6 decimals; Mainnet USDso is 18 decimals)
* **How to Obtain (Built-In Script):**
  Once your wallet has STT for gas, run the automated bootstrap script:
  ```bash
  npm run agent:faucet
  ```
  *(This calls DreamDEX's built-in `exchange.trader.faucet()`, dripping 10,000 tUSDC directly into your configured wallet).*

---

## 2. Somnia Shannon Network Configuration

Add the Somnia Shannon Testnet to MetaMask or your Web3 wallet using these parameters:

| Parameter | Value |
|---|---|
| **Network Name** | Somnia Shannon Testnet |
| **Chain ID** | `50312` |
| **Currency Symbol** | `STT` |
| **RPC URL (HTTP)** | `https://dream-rpc.somnia.network` |
| **Alternative RPC** | `https://api.infra.testnet.somnia.network/` |
| **WebSocket RPC** | `wss://api.infra.testnet.somnia.network/ws` |
| **Block Explorer** | [https://shannon-explorer.somnia.network](https://shannon-explorer.somnia.network) |

---

## 3. Protocol & Indexer Endpoints

| Service | Endpoint URL | Purpose |
|---|---|---|
| **DreamDEX GraphQL Indexer** | `https://dev.smk.somnia.host/v1/graphql` | Queries active binary markets, order books, candles, and finalized states. |
| **Somnia Production Oracle** | `https://prd.oracle.somnia.host/questions/{oracleQuestionId}?view=graph` | Deep-link target for verifying cryptographic settlement proofs on-chain. |
| **Somnia Shannon WebSocket** | `wss://api.infra.testnet.somnia.network/ws` | Real-time event subscription for order fills and state transitions. |

---

## 4. DreamDEX Core Contract Addresses (Somnia Shannon)

These addresses are officially deployed and baked into `@somnia-chain/markets-sdk`:

```json
{
  "collateral": "0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E",
  "binaryModule": "0x3ecC694Cef705358864a646142ac17A90E29e388",
  "binarySettlement": "0xbF4a49e0Dfd092e5FBE8E5761064C49533e6Ed23",
  "binaryPoolBeacon": "0x85C01B5ef4F4ed59caC69749565e309f01b14Dbc",
  "binaryPoolImpl": "0x48e523c9f22f98548d263f0aD444D732e5202C0E",
  "clobFactory": "0x1a478019Ae4d24249a962934af0f129CE98B5e6f",
  "marketCreator": "0x138CfA6b80475b8c03d7E468b2442278E51e645a",
  "oracleHub": "0xe40db387cC98601Dd11bd634fF2f3AD5686dE32b"
}
```

---

## 5. Local Environment Configuration (`.env.local`)

Create or update your `.env.local` in the project root:

```env
NETWORK=testnet

# The private key for the quoting agent wallet (must be funded with STT and tUSDC)
# In Single-Wallet Demo Mode, you can use the same private key as your connected browser wallet
AGENT_PRIVATE_KEY=0x...

# Somnia Shannon Testnet Parameters
NEXT_PUBLIC_CHAIN_ID=50312
NEXT_PUBLIC_RPC_URL=https://dream-rpc.somnia.network
NEXT_PUBLIC_WS_RPC=wss://api.infra.testnet.somnia.network/ws
NEXT_PUBLIC_INDEXER_URL=https://dev.smk.somnia.host/v1/graphql

# Optional: Deployed PulseAudit.sol address for on-chain decision attestation
NEXT_PUBLIC_AUDIT_CONTRACT=

# Quoting Agent Parameters
AGENT_HALF_SPREAD=0.02
AGENT_SIZE_PER_SIDE=5
AGENT_INTERVAL_MS=15000
```

> [!CAUTION]
> Never commit `.env.local` to git. Only use testnet private keys with zero real-world value.

---

## 6. Pre-Flight Checklist

Before recording your demo video or presenting to judges, ensure:

- [ ] **STT Gas in Wallet:** Confirm your wallet shows at least 0.05 STT on Somnia Shannon Explorer.
- [ ] **tUSDC Collateral Funded:** Confirm `npm run agent:faucet` succeeded and your balance shows tUSDC.
- [ ] **Web Terminal Running:** `npm run dev:web` runs at `http://localhost:3000`.
- [ ] **Wallet Connected:** Connect MetaMask in the browser and verify the "Shannon Testnet" badge turns green.
- [ ] **Capital Radar Verified:** Open `/claims` and verify it discovers finalized contracts.
- [ ] **Quoting Agent Running:** Run `npm run agent` in a separate terminal and confirm it prints active market quotes every 15 seconds.

