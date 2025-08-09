import type { Pair } from "./types"

// For reliable demo pricing on Solana, use Jupiter public quote API.
// In production, prefer on-chain quoting or firm RFQ with slippage/MEV controls.
export async function getSolanaPriceViaJupiter(pair: Pair): Promise<number> {
  const base = pair.base
  const quote = pair.quote
  const amountBase = 1
  const url = `https://quote-api.jup.ag/v6/quote?inputMint=${resolveMint(base)}&outputMint=${resolveMint(
    quote,
  )}&amount=${toLamports(base, amountBase)}&slippageBps=50`
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error("Jupiter quote failed")
  const data = await res.json()
  const outAmount = Number(data?.data?.[0]?.outAmount || 0)
  if (outAmount <= 0) throw new Error("No route")
  const price = outAmount / 10 ** decimals(quote) / amountBase
  return price
}

// Simplified mint/decimals mapping for demo. Extend as needed.
function resolveMint(symbol: string) {
  switch (symbol) {
    case "SOL":
      return "So11111111111111111111111111111111111111112"
    case "USDT":
      return "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"
    default:
      throw new Error(`Unsupported Solana symbol: ${symbol}`)
  }
}
function decimals(symbol: string) {
  switch (symbol) {
    case "SOL":
      return 9
    case "USDT":
      return 6
    default:
      return 9
  }
}
function toLamports(symbol: string, amount: number) {
  return Math.round(amount * 10 ** decimals(symbol))
}
