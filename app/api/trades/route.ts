import { NextResponse } from "next/server"
import { getTradeStore } from "@/lib/store"

export async function GET() {
  const store = getTradeStore()
  return NextResponse.json({ trades: store.all() })
}
