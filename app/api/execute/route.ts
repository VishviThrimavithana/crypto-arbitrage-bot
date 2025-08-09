import { type NextRequest, NextResponse } from "next/server"
import { executeOpportunity } from "@/lib/execute"
import { getTradeStore } from "@/lib/store"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const id: string = body?.id
    const dryRun: boolean = body?.dryRun ?? true
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

    const result = await executeOpportunity(id, { dryRun })
    // Save to history
    const store = getTradeStore()
    store.append(result.record)

    return NextResponse.json({ status: "ok", message: result.message, record: result.record })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Execution failed" }, { status: 500 })
  }
}
