import { SomniaMarkets, SOMNIA_TESTNET_ADDRESSES } from "@somnia-chain/markets-sdk";
import { somniaShannon } from "@somnia-chain/markets-sdk/chains";

export interface ExchangeClientOptions {
  privateKey?: `0x${string}`;
  rpcUrl?: string;
  indexerUrl?: string;
  wsRpcUrl?: string;
}

export interface UnwrapReceiptResult {
  receipt?: any;
  isReverted: boolean;
  transactionHash?: string;
}

/**
 * Unwraps order receipt safely from DreamDEX unified createOrder return value.
 * In @somnia-chain/markets-sdk, order.receipt is undefined on unified verbs;
 * the actual transaction receipt lives in (order.info as PlaceOrderResult).receipt.
 */
export function unwrapReceipt(orderResult: any): UnwrapReceiptResult {
  if (!orderResult) {
    return { isReverted: true };
  }

  // Check nested info receipt first, then fallback to top-level
  const receipt = orderResult.info?.receipt || orderResult.receipt;
  const isReverted = receipt?.status === "reverted";
  const transactionHash = receipt?.transactionHash || orderResult.info?.transactionHash || orderResult.id;

  return {
    receipt,
    isReverted,
    transactionHash,
  };
}

/**
 * Creates and initializes a SomniaMarkets instance on Somnia Shannon Testnet.
 */
export function createExchangeClient(options: ExchangeClientOptions = {}): SomniaMarkets {
  const rpcUrl = options.rpcUrl || process.env.NEXT_PUBLIC_RPC_URL || "https://dream-rpc.somnia.network";
  const indexerUrl = options.indexerUrl || process.env.NEXT_PUBLIC_INDEXER_URL || "https://dev.smk.somnia.host/v1/graphql";
  const wsRpcUrl = options.wsRpcUrl || process.env.NEXT_PUBLIC_WS_RPC || "wss://api.infra.testnet.somnia.network/ws";
  const privateKey = options.privateKey || (process.env.AGENT_PRIVATE_KEY as `0x${string}`);

  const config: any = {
    chain: somniaShannon,
    addresses: SOMNIA_TESTNET_ADDRESSES,
    rpcUrl,
    indexerUrl,
    wsRpcUrl,
  };

  if (privateKey && privateKey.startsWith("0x")) {
    config.privateKey = privateKey;
  }

  return new SomniaMarkets(config);
}

/**
 * Dynamically queries decimals from collateral token contract rather than hardcoding.
 * (Testnet tUSDC is 6 decimals, Mainnet USDso is 18 decimals).
 */
export async function getCollateralDecimals(exchange: any, tokenAddress?: string): Promise<number> {
  try {
    if (tokenAddress && exchange.client?.getTokenDecimals) {
      return await exchange.client.getTokenDecimals(tokenAddress);
    }
  } catch {
    // Graceful fallback
  }
  return 6; // Default to 6 decimals for Somnia Shannon testnet tUSDC
}

