import { type NextRequest, NextResponse } from "next/server"
import { findOpportunities } from "@/lib/arbitrage"
import { getDefaultConfig } from "@/lib/config"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const threshold = Number(searchParams.get("threshold") ?? getDefaultConfig().minDiffPct)
    const sizeQuote = Number(searchParams.get("sizeQuote") ?? getDefaultConfig().defaultSizeQuote)
    const opportunities = await findOpportunities({ threshold, sizeQuote })
    return NextResponse.json({ opportunities })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to compute opportunities" }, { status: 500 })
  }
}
