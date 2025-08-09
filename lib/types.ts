export type ChainId = "ethereum" | "bsc" | "polygon" | "solana"

export type DexId = "UniswapV2" | "PancakeV2" | "QuickSwap" | "Raydium"
export type CexId = "Binance" | "KuCoin" | "Kraken"

export type Pair = { base: string; quote: string; chain: ChainId }

export type Quote = {
  venue: DexId | CexId
  chain?: ChainId
  base: string
  quote: string
  price: number // quote per base
  kind: "DEX" | "CEX"
  meta?: Record<string, any>
}

export type Opportunity = {
  id: string
  base: string
  quote: string
  chain: ChainId
  buyOn: DexId | CexId
  sellOn: DexId | CexId
  buyPrice: number
  sellPrice: number
  diffPct: number
  estProfitUsd: number
  sizeQuote: number
  feesUsd: number
  gasUsd: number
  slippagePct: number
  timestamp: number
}

export type ExecutionRecord = {
  id: string
  base: string
  quote: string
  chain: ChainId
  buyOn: DexId | CexId
  sellOn: DexId | CexId
  sizeQuote: number
  pnlUsd: number
  feesUsd: number
  gasUsd: number
  timestamp: number
  dryRun: boolean
  txHashes: string[]
  notes?: string
}
