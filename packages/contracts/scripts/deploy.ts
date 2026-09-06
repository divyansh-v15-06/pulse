import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import fs from "fs";
import path from "path";
import { createWalletClient, createPublicClient, http, defineChain, Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const somniaShannon = defineChain({
  id: 50312,
  name: "Somnia Shannon Testnet",
  nativeCurrency: {
    name: "Somnia Test Token",
    symbol: "STT",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_URL || "https://dream-rpc.somnia.network"],
    },
  },
  testnet: true,
});

async function main() {
  console.log("=================================================");
  console.log("     DEPLOYING PULSEAUIDT.SOL TO SOMNIA SHANNON   ");
  console.log("=================================================");

  const rawKey = process.env.AGENT_PRIVATE_KEY || process.env.PRIVATE_KEY;
  if (!rawKey || !rawKey.startsWith("0x")) {
    console.error("\n[Error] Private key missing! Set AGENT_PRIVATE_KEY in .env.local");
    console.error("Format: AGENT_PRIVATE_KEY=0x<your_hex_private_key>\n");
    process.exit(1);
  }
  const privateKey = rawKey as Hex;

  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://dream-rpc.somnia.network";
  console.log(`[Network] RPC: ${rpcUrl} (Chain ID: 50312)`);

  const account = privateKeyToAccount(privateKey);
  console.log(`[Deployer] Address: ${account.address}`);

  const publicClient = createPublicClient({
    chain: somniaShannon,
    transport: http(rpcUrl),
  });

  const walletClient = createWalletClient({
    account,
    chain: somniaShannon,
    transport: http(rpcUrl),
  });

  // Check deployer balance
  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`[Deployer] STT Gas Balance: ${(Number(balance) / 1e18).toFixed(4)} STT`);

  if (balance === 0n) {
    console.warn("\n[Warning] Your wallet has 0 STT! Deployment may fail due to gas.");
    console.warn("Get testnet STT from https://testnet.somnia.network or Discord (#dev-chat).\n");
  }

  // Load ABI and Bytecode
  const artifactDir = path.resolve(__dirname, "../artifacts");
  const abiPath = path.join(artifactDir, "packages_contracts_src_PulseAudit_sol_PulseAudit.abi");
  const binPath = path.join(artifactDir, "packages_contracts_src_PulseAudit_sol_PulseAudit.bin");

  if (!fs.existsSync(binPath) || !fs.existsSync(abiPath)) {
    console.error("\n[Error] Artifacts not found! Compiling contract first...");
    process.exit(1);
  }

  const abi = JSON.parse(fs.readFileSync(abiPath, "utf-8"));
  const bytecode = ("0x" + fs.readFileSync(binPath, "utf-8").trim()) as Hex;

  console.log("[Deploying] Sending contract deployment transaction to Somnia L1...");
  const txHash = await walletClient.deployContract({
    abi,
    bytecode,
  });

  console.log(`[Transaction] Hash: ${txHash}`);
  console.log(`[Explorer] https://shannon-explorer.somnia.network/tx/${txHash}`);
  console.log("Waiting for block confirmation...");

  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

  if (receipt.status !== "success" || !receipt.contractAddress) {
    console.error("[Failed] Deployment reverted or contract address missing!");
    process.exit(1);
  }

  const contractAddress = receipt.contractAddress;
  console.log("\n=================================================");
  console.log(` SUCCESS! PulseAudit deployed at: ${contractAddress}`);
  console.log("=================================================\n");

  // Automatically update .env.local if present
  const envLocalPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envLocalPath)) {
    let envContent = fs.readFileSync(envLocalPath, "utf-8");
    if (envContent.includes("NEXT_PUBLIC_AUDIT_CONTRACT=")) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_AUDIT_CONTRACT=.*/,
        `NEXT_PUBLIC_AUDIT_CONTRACT=${contractAddress}`
      );
    } else {
      envContent += `\nNEXT_PUBLIC_AUDIT_CONTRACT=${contractAddress}\n`;
    }
    fs.writeFileSync(envLocalPath, envContent);
    console.log(`[Config] Automatically updated NEXT_PUBLIC_AUDIT_CONTRACT in .env.local!`);
  } else {
    console.log(`Add this to your .env.local:\nNEXT_PUBLIC_AUDIT_CONTRACT=${contractAddress}`);
  }
}

main().catch((err) => {
  console.error("[Fatal Deployment Error]:", err);
  process.exit(1);
});
