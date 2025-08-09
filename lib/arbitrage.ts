import type { ChainId, Opportunity, Pair, Quote } from "./types"
import { getDefaultConfig } from "./config"
import { getDexPriceV2 } from "./evm-dex"
import { getSolanaPriceViaJupiter } from "./solana-dex"
import { binancePrice, kucoinPrice, krakenPrice, nativeUsdFromBinance } from "./cex"
import { estimateGasUsd } from "./costs"
import { putLastSnapshot } from "./store"

// Gather quotes for a pair across DEX and CEX
async function gatherQuotes(pair: Pair): Promise<Quote[]> {
  const quotes: Quote[] = []
  // CEX
  await Promise.allSettled([
    binancePrice(pair).then((price) =>
      quotes.push({ venue: "Binance", base: pair.base, quote: pair.quote, price, kind: "CEX" }),
    ),
    kucoinPrice(pair).then((price) =>
      quotes.push({ venue: "KuCoin", base: pair.base, quote: pair.quote, price, kind: "CEX" }),
    ),
    krakenPrice(pair).then((price) =>
      quotes.push({ venue: "Kraken", base: pair.base, quote: pair.quote, price, kind: "CEX" }),
    ),
  ])

  // DEX
  if (pair.chain === "ethereum") {
    try {
      const price = await getDexPriceV2({ chain: "ethereum", dex: "UniswapV2", base: pair.base, quote: pair.quote })
      quotes.push({ venue: "UniswapV2", chain: "ethereum", base: pair.base, quote: pair.quote, price, kind: "DEX" })
    } catch {}
  } else if (pair.chain === "bsc") {
    try {
      const price = await getDexPriceV2({ chain: "bsc", dex: "PancakeV2", base: pair.base, quote: pair.quote })
      quotes.push({ venue: "PancakeV2", chain: "bsc", base: pair.base, quote: pair.quote, price, kind: "DEX" })
    } catch {}
  } else if (pair.chain === "polygon") {
    try {
      const price = await getDexPriceV2({ chain: "polygon", dex: "QuickSwap", base: pair.base, quote: pair.quote })
      quotes.push({ venue: "QuickSwap", chain: "polygon", base: pair.base, quote: pair.quote, price, kind: "DEX" })
    } catch {}
  } else if (pair.chain === "solana") {
    try {
      const price = await getSolanaPriceViaJupiter(pair)
      quotes.push({ venue: "Raydium", chain: "solana", base: pair.base, quote: pair.quote, price, kind: "DEX" })
    } catch {}
  }

  return quotes
}

function feePct(kind: "DEX" | "CEX") {
  const cfg = getDefaultConfig()
  return kind === "DEX" ? cfg.dexFeePct / 100 : cfg.cexTakerFeePct / 100
}

async function nativeSymbol(chain: ChainId) {
  switch (chain) {
    case "ethereum":
      return "ETH"
    case "bsc":
      return "BNB"
    case "polygon":
      return "MATIC"
    case "solana":
      return "SOL"
  }
}

export async function findOpportunities(params?: { threshold?: number; sizeQuote?: number }): Promise<Opportunity[]> {
  const cfg = getDefaultConfig()
  const thr = params?.threshold ?? cfg.minDiffPct
  const size = params?.sizeQuote ?? cfg.defaultSizeQuote
  const results: Opportunity[] = []

  const pairs = cfg.pairs
  for (const pair of pairs) {
    const quotes = await gatherQuotes(pair)
    if (quotes.length < 2) continue

    // Compare all pairs of venues
    for (let i = 0; i < quotes.length; i++) {
      for (let j = 0; j < quotes.length; j++) {
        if (i === j) continue
        const buy = quotes[i]
        const sell = quotes[j]
        // We buy base with quote at lower price, and sell base for quote at higher price
        if (buy.price >= sell.price) continue
        const diffPct = ((sell.price - buy.price) / buy.price) * 100

        // Economic adjustments
        const totalFeesUsd = size * (feePct(buy.kind) + feePct(sell.kind))
        const slippagePct = cfg.slippagePct
        const slippageUsd = size * (slippagePct / 100)

        // Gas estimate on DEX side (if any)
        let gasUsd = 0
        const dexChain: ChainId | undefined =
          buy.kind === "DEX" ? (buy.chain as any) : sell.kind === "DEX" ? (sell.chain as any) : undefined
        if (dexChain) {
          const native = await nativeSymbol(dexChain)
          const nativeUsd = await nativeUsdFromBinance(native)
          gasUsd = await estimateGasUsd(dexChain, nativeUsd)
        }

        // Profit on sizeQuote:
        // Effective sell proceeds minus cost
        const gross = (sell.price - buy.price) * (size / buy.price) // in quote units? Simplify to USD since quote=USDT
        // Simplify: size is in USDT, profit in USDT ~= USD
        const estProfitUsd = gross - totalFeesUsd - slippageUsd - gasUsd

        if (diffPct >= thr) {
          const id = `${pair.base}-${pair.quote}-${pair.chain}-${buy.venue}-to-${sell.venue}`
          results.push({
            id,
            base: pair.base,
            quote: pair.quote,
            chain: pair.chain,
            buyOn: buy.venue as any,
            sellOn: sell.venue as any,
            buyPrice: buy.price,
            sellPrice: sell.price,
            diffPct,
            estProfitUsd,
            sizeQuote: size,
            feesUsd: totalFeesUsd + slippageUsd,
            gasUsd,
            slippagePct,
            timestamp: Date.now(),
          })
        }
      }
    }
  }

  // Persist last snapshot (in-memory)
  putLastSnapshot(results)

  return results.sort((a, b) => b.estProfitUsd - a.estProfitUsd).slice(0, 50)
}
