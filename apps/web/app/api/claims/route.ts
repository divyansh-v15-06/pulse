import { NextRequest, NextResponse } from "next/server";
import { createExchangeClient, findClaimablePositions } from "@pulse/core";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address") as `0x${string}` | null;

    if (!address || !address.startsWith("0x")) {
      return NextResponse.json(
        { error: "Missing or invalid 'address' query parameter." },
        { status: 400 }
      );
    }

    const exchange = createExchangeClient({
      rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "https://dream-rpc.somnia.network",
      indexerUrl: process.env.NEXT_PUBLIC_INDEXER_URL || "https://dev.smk.somnia.host/v1/graphql",
    });

    const result = await findClaimablePositions(exchange, address);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[API /api/claims] Error scanning finalized positions:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to scan claimable positions" },
      { status: 500 }
    );
  }
}

