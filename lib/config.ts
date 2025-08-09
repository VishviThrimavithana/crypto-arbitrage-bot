import type { ChainId, Pair } from "./types"

export function getDefaultConfig() {
  return {
    // scanning universe
    pairs: [
      { base: "ETH", quote: "USDT", chain: "ethereum" },
      { base: "BNB", quote: "USDT", chain: "bsc" },
      { base: "MATIC", quote: "USDT", chain: "polygon" },
      { base: "SOL", quote: "USDT", chain: "solana" },
    ] as Pair[],
    // economics & thresholds
    minDiffPct: Number(process.env.MIN_DIFF_PCT ?? 0.5),
    defaultSizeQuote: Number(process.env.DEFAULT_SIZE_QUOTE ?? 1000),
    dexFeePct: Number(process.env.DEX_FEE_PCT ?? 0.3), // 0.30%
    cexTakerFeePct: Number(process.env.CEX_TAKER_FEE_PCT ?? 0.1), // 0.10%
    slippagePct: Number(process.env.SLIPPAGE_PCT ?? 0.5), // 0.50%
    dryRun: String(process.env.DRY_RUN ?? "true") === "true",
  }
}

export function getRpc(chain: ChainId) {
  switch (chain) {
    case "ethereum":
      return process.env.ETHEREUM_RPC_URL || ""
    case "bsc":
      return process.env.BSC_RPC_URL || ""
    case "polygon":
      return process.env.POLYGON_RPC_URL || ""
    case "solana":
      return process.env.SOLANA_RPC_URL || ""
  }
}
