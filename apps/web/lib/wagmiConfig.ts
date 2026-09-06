import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

export const somniaShannonTestnet = defineChain({
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
      webSocket: [process.env.NEXT_PUBLIC_WS_RPC || "wss://dream-rpc.somnia.network/ws"],
    },
  },
  blockExplorers: {
    default: {
      name: "Somnia Explorer",
      url: "https://shannon-explorer.somnia.network",
    },
  },
  testnet: true,
});

export const wagmiConfig = getDefaultConfig({
  appName: "Pulse Protocol",
  projectId: "4f9b2d3e1a8c7b6d5e4f3a2b1c0d9e8f", // standard public demo project ID
  chains: [somniaShannonTestnet],
  ssr: true,
});

