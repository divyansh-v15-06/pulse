import { createWalletClient, http, toHex, keccak256, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export const somniaShannonChain = defineChain({
  id: 50312,
  name: "Somnia Shannon Testnet",
  nativeCurrency: {
    name: "Somnia Test Token",
    symbol: "STT",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://dream-rpc.somnia.network"],
    },
  },
  testnet: true,
});

// Minimal ABI for PulseAudit
export const PULSE_AUDIT_ABI = [
  {
    type: "function",
    name: "recordDecision",
    inputs: [
      { name: "marketId", type: "bytes32" },
      { name: "predictedProbBps", type: "uint16" },
      { name: "brierScoreBps", type: "uint16" },
      { name: "decisionHash", type: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "QuotingProofRecorded",
    inputs: [
      { name: "marketId", type: "bytes32", indexed: true },
      { name: "agent", type: "address", indexed: true },
      { name: "predictedProbBps", type: "uint16", indexed: false },
      { name: "brierScoreBps", type: "uint16", indexed: false },
      { name: "decisionHash", type: "bytes32", indexed: false },
    ],
  },
] as const;

export interface OnChainAuditInput {
  marketId: string;
  predictedProbUp: number; // in [0, 1]
  brierScore: number;      // in [0, 1]
  spotPrice?: number;
  strikePrice?: number;
  halfSpread: number;
  timestamp: number;
}

/**
 * Computes deterministic SHA-256 decision hash over quoting parameters
 */
export function computeDecisionHash(input: OnChainAuditInput): `0x${string}` {
  const payload = JSON.stringify({
    marketId: input.marketId,
    p: input.predictedProbUp,
    b: input.brierScore,
    s: input.spotPrice ?? 0,
    k: input.strikePrice ?? 0,
    spread: input.halfSpread,
    ts: input.timestamp,
  });
  return keccak256(toHex(payload));
}

/**
 * Normalizes market ID string to bytes32 format
 */
export function normalizeMarketIdToBytes32(marketId: string): `0x${string}` {
  if (marketId.startsWith("0x") && marketId.length === 66) {
    return marketId as `0x${string}`;
  }
  return keccak256(toHex(marketId));
}

/**
 * Records an immutable decision proof on Somnia Shannon testnet
 */
export async function recordDecisionOnChain(
  auditContractAddress: `0x${string}`,
  privateKey: `0x${string}`,
  rpcUrl: string,
  input: OnChainAuditInput
): Promise<{ txHash?: string; error?: string }> {
  try {
    if (!auditContractAddress || !auditContractAddress.startsWith("0x")) {
      return { error: "PulseAudit contract address not configured" };
    }

    const account = privateKeyToAccount(privateKey);
    const client = createWalletClient({
      account,
      chain: somniaShannonChain,
      transport: http(rpcUrl || "https://dream-rpc.somnia.network"),
    });

    const marketIdBytes32 = normalizeMarketIdToBytes32(input.marketId);
    const predictedProbBps = Math.round(input.predictedProbUp * 10000);
    const brierScoreBps = Math.round(input.brierScore * 10000);
    const decisionHash = computeDecisionHash(input);

    const hash = await client.writeContract({
      address: auditContractAddress,
      abi: PULSE_AUDIT_ABI,
      functionName: "recordDecision",
      args: [marketIdBytes32, predictedProbBps, brierScoreBps, decisionHash],
    });

    return { txHash: hash };
  } catch (err: any) {
    return { error: err?.message || String(err) };
  }
}

