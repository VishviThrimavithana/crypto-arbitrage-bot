import { NextResponse } from "next/server"
import { getTradeStore } from "@/lib/store"

export async function POST() {
  // Create a fake profitable record for demo purposes
  const store = getTradeStore()
  const record = {
    id: `sim-${Date.now()}`,
    base: "ETH",
    quote: "USDT",
    chain: "ethereum",
    buyOn: "UniswapV2",
    sellOn: "Binance",
    sizeQuote: 1000,
    pnlUsd: 12.34,
    feesUsd: 3.2,
    gasUsd: 2.1,
    timestamp: Date.now(),
    dryRun: true,
    txHashes: [],
    notes: "Simulated profitable trade",
  }
  store.append(record)
  return NextResponse.json({ status: "ok", message: "Simulated trade added", record })
}
