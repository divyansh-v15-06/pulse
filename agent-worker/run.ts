import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { createExchangeClient, PulseQuotingAgent } from "@pulse/core";

async function main() {
  console.log("=================================================");
  console.log("   PULSE AUTONOMOUS QUOTING AGENT (SOMNIA L1)   ");
  console.log("=================================================");

  const privateKey = process.env.AGENT_PRIVATE_KEY as `0x${string}`;
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://dream-rpc.somnia.network";
  const auditContractAddress = process.env.NEXT_PUBLIC_AUDIT_CONTRACT as `0x${string}` | undefined;
  const halfSpread = parseFloat(process.env.AGENT_HALF_SPREAD || "0.02");
  const sizePerSide = parseFloat(process.env.AGENT_SIZE_PER_SIDE || "5");
  const intervalMs = parseInt(process.env.AGENT_INTERVAL_MS || "15000", 10);

  if (!privateKey || !privateKey.startsWith("0x")) {
    console.error("FATAL: AGENT_PRIVATE_KEY not set in environment or .env.local");
    process.exit(1);
  }

  console.log(`[Config] HalfSpread: ${halfSpread} | Size/Side: ${sizePerSide} | Interval: ${intervalMs}ms`);
  console.log(`[Network] Somnia Shannon RPC: ${rpcUrl}`);
  if (auditContractAddress) {
    console.log(`[On-Chain Audit] PulseAudit.sol: ${auditContractAddress}`);
  } else {
    console.log("[On-Chain Audit] PulseAudit.sol: Not configured (running local proofs only)");
  }

  const exchange = createExchangeClient({ privateKey, rpcUrl });
  console.log("Initializing DreamDEX exchange...");
  await exchange.loadMarkets();

  // Try funding on startup if fresh wallet
  try {
    const bal = await exchange.fetchBalance();
    console.log("[Balance Check] Total Balance:", bal?.total || bal);
  } catch {
    console.log("Attempting initial faucet drip...");
    try {
      await exchange.trader.faucet();
    } catch {}
  }

  const agent = new PulseQuotingAgent(exchange, {
    halfSpread,
    sizePerSide,
    privateKey,
    rpcUrl,
    auditContractAddress,
    useBlackScholes: true,
  });

  console.log(`[Engine] Model: ${agent.getActiveModelName()}`);
  console.log("[Engine] Starting 15-second autonomous market-making loop...\n");

  let passCount = 0;

  const runLoop = async () => {
    passCount++;
    console.log(`--- [Pass #${passCount}] ${new Date().toISOString()} ---`);
    try {
      const summary = await agent.runQuotingPass();
      console.log(
        `Scanned: ${summary.marketsScanned} | Quoted: ${summary.marketsQuoted} | Orders Placed: ${summary.ordersPlaced.length} | Brier: ${summary.brierScore} | Spread: ${(summary.effectiveSpread * 100).toFixed(1)}%`
      );

      for (const order of summary.ordersPlaced) {
        if (order.wouldCross) {
          console.log(`  [PostOnlyCross] ${order.symbol} @ ${order.price} (spread adjusted next pass)`);
        } else if (order.error) {
          console.warn(`  [Order Error] ${order.symbol}: ${order.error}`);
        } else {
          console.log(`  [Order Resting] ${order.outcome} ${order.symbol} @ ${order.price} (Tx: ${order.txHash || "ok"})`);
        }
      }

      if (summary.auditTxHashes.length > 0) {
        console.log(`  [Somnia Attestation] Tx Hashes: ${summary.auditTxHashes.join(", ")}`);
      }

      // Periodically update resolution status of previous predictions
      if (passCount % 4 === 0) {
        await agent.updateSettledOutcomes();
      }
    } catch (err) {
      console.error("[Loop Error]:", err);
    }
  };

  // Run immediate first pass
  await runLoop();

  // Schedule recurring loop
  setInterval(runLoop, intervalMs);
}

main().catch(console.error);

