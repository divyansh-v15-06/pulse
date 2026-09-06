import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { createExchangeClient } from "@pulse/core";

async function main() {
  console.log("=== Pulse Faucet Bootstrap ===");
  const privateKey = process.env.AGENT_PRIVATE_KEY as `0x${string}`;

  if (!privateKey || !privateKey.startsWith("0x")) {
    console.error("Error: AGENT_PRIVATE_KEY is not set in .env.local");
    process.exit(1);
  }

  const exchange = createExchangeClient({ privateKey });

  console.log("Connecting to DreamDEX exchange on Somnia Shannon testnet...");
  await exchange.loadMarkets();

  console.log("Requesting testnet tUSDC from DreamDEX faucet...");
  try {
    const res = await exchange.trader.faucet();
    console.log("Faucet request result:", res);
  } catch (err: any) {
    console.warn("Faucet request note:", err?.message || err);
  }

  try {
    const balance = await exchange.fetchBalance();
    console.log("Agent Wallet Balance:", JSON.stringify(balance, null, 2));
  } catch (err) {
    console.log("Note: Could not query balance:", err);
  }

  console.log("Faucet bootstrap complete.");
}

main().catch(console.error);

