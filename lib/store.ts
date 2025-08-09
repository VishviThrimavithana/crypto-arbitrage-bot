import type { ExecutionRecord, Opportunity } from "./types"

// In-memory store for demo. Replace with Neon/Postgres for persistence.
let _trades: ExecutionRecord[] = []
let _snapshot: Opportunity[] = []

export function getTradeStore() {
  return {
    append: (r: ExecutionRecord) => {
      _trades.unshift(r)
      if (_trades.length > 500) _trades.pop()
    },
    all: () => _trades,
    clear: () => (_trades = []),
  }
}

export function putLastSnapshot(ops: Opportunity[]) {
  _snapshot = ops
}

export function getSnapshot(): Opportunity[] {
  return _snapshot
}
