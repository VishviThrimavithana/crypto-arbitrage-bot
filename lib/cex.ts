import type { Pair } from "./types"

// Binance: price is quote per base (e.g., ETHUSDT)
export async function binancePrice(pair: Pair): Promise<number> {
  const symbol = `${pair.base}${pair.quote}`
  const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error("Binance price failed")
  const data = await res.json()
  const price = Number(data?.price || 0)
  if (!price) throw new Error("Binance price zero")
  return price
}

// KuCoin: symbol uses dash, e.g., ETH-USDT
export async function kucoinPrice(pair: Pair): Promise<number> {
  const symbol = `${pair.base}-${pair.quote}`
  const url = `https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${symbol}`
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error("KuCoin price failed")
  const data = await res.json()
  const price = Number(data?.data?.price || 0)
  if (!price) throw new Error("KuCoin price zero")
  return price
}

// Kraken: uses special pairs; best-effort mapping for common
function krakenMap(base: string, quote: string) {
  // Common mappings
  const mapBase: Record<string, string> = { BTC: "XBT", ETH: "ETH", USDT: "USDT", SOL: "SOL", MATIC: "MATIC" }
  const b = mapBase[base] ?? base
  const q = mapBase[quote] ?? quote
  // Kraken pairs are sometimes suffixed: XBTUSDT, ETHUSDT, etc.
  return `${b}${q}`
}

export async function krakenPrice(pair: Pair): Promise<number> {
  const krakenPair = krakenMap(pair.base, pair.quote)
  const url = `https://api.kraken.com/0/public/Ticker?pair=${krakenPair}`
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error("Kraken price failed")
  const data = await res.json()
  const result = data?.result || {}
  const firstKey = Object.keys(result)[0]
  const price = Number(result?.[firstKey]?.c?.[0] || 0) // last trade close
  if (!price) throw new Error("Kraken price zero")
  return price
}

export async function nativeUsdFromBinance(native: string): Promise<number> {
  const url = `https://api.binance.com/api/v3/ticker/price?symbol=${native}USDT`
  const res = await fetch(url, { cache: "no-store" })
  const json = await res.json()
  return Number(json?.price || 0)
}
