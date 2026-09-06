import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { createExchangeClient, PulseQuotingAgent } from "../packages/core/src/index";

async function testAgentPass() {
  console.log("=== Testing Pulse Quoting Agent Single Pass ===");
  const privateKey = process.env.AGENT_PRIVATE_KEY as `0x${string}`;
  const exchange = createExchangeClient({
    privateKey,
    rpcUrl: "https://dream-rpc.somnia.network",
    indexerUrl: "https://dev.smk.somnia.host/v1/graphql",
    wsRpcUrl: "wss://api.infra.testnet.somnia.network/ws",
  });

  console.log("1. Instantiating PulseQuotingAgent with BlackScholesBinaryModel...");
  const agent = new PulseQuotingAgent(exchange, {
    halfSpread: 0.02,
    sizePerSide: 5,
    minSecondsLeft: 60,
    privateKey,
    useBlackScholes: true,
  });

  console.log(`Active Model: ${agent.getActiveModelName()}`);

  console.log("2. Running single quoting pass...");
  const summary = await agent.runQuotingPass();

  console.log("\n=== Quoting Pass Summary ===");
  console.log(`Markets Scanned: ${summary.marketsScanned}`);
  console.log(`Markets Quoted: ${summary.marketsQuoted}`);
  console.log(`Orders Attempted: ${summary.ordersPlaced.length}`);
  console.log(`Brier Score: ${summary.brierScore}`);
  console.log(`Effective Spread: ${(summary.effectiveSpread * 100).toFixed(1)}%`);

  if (summary.ordersPlaced.length > 0) {
    console.log("Sample Order:", summary.ordersPlaced[0]);
  }

  console.log("\n>>> Quoting Agent Test Pass COMPLETE! <<<");
  process.exit(0);
}

testAgentPass().catch((err) => {
  console.error("Test pass failed:", err);
  process.exit(1);
});

