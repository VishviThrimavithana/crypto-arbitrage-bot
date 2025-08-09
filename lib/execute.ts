import type { ExecutionRecord } from "./types"
import { getDefaultConfig } from "./config"
import { getSnapshot, getTradeStore } from "./store"

// NOTE: Live execution requires:
// - Pre-funded inventory on both venues OR a bridge/flashloan strategy
// - Approvals and router calls on DEX
// - Authenticated client for CEX with trade/withdraw permissions
// This demo keeps execution as a simulation unless DRY_RUN=false with full setup.

export async function executeOpportunity(
  id: string,
  opts?: { dryRun?: boolean },
): Promise<{ message: string; record: ExecutionRecord }> {
  const cfg = getDefaultConfig()
  const dryRun = opts?.dryRun ?? cfg.dryRun
  const snap = getSnapshot()
  const op = snap.find((o) => o.id === id)
  if (!op) throw new Error("Opportunity not found or stale")

  // Simulated PnL equals estProfitUsd (can apply haircuts)
  const pnlUsd = Math.max(0, op.estProfitUsd)

  if (!dryRun) {
    // Sanity guard
    throw new Error(
      "Live execution is disabled in this demo. Enable carefully after configuring wallets, approvals, and CEX API clients.",
    )
    // Implement:
    // - If buyOn is DEX: build router calldata and sign/send with Ethers
    // - If buyOn is CEX: place market/limit order via API
    // - Mirror on sell side
    // - Handle settlements, balances, and failure modes
  }

  const record: ExecutionRecord = {
    id: `${op.id}-${Date.now()}`,
    base: op.base,
    quote: op.quote,
    chain: op.chain,
    buyOn: op.buyOn,
    sellOn: op.sellOn,
    sizeQuote: op.sizeQuote,
    pnlUsd,
    feesUsd: op.feesUsd,
    gasUsd: op.gasUsd,
    timestamp: Date.now(),
    dryRun: true,
    txHashes: [],
    notes: "Simulated",
  }

  getTradeStore().append(record)

  return { message: `Executed ${op.base}/${op.quote} ${op.buyOn} -> ${op.sellOn}`, record }
}
