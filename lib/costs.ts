import type { ChainId } from "./types"
import { getRpc } from "./config"
import { ethers } from "ethers"

// Rough gas usage for a V2 router swapExactTokensForTokens
const GAS_LIMIT_BY_CHAIN: Record<ChainId, number> = {
  ethereum: 180_000,
  bsc: 160_000,
  polygon: 190_000,
  solana: 200_000, // not EVM, we handle separately but kept for interface
}

// If we cannot reach RPC, fallback fixed gasUsd
const FALLBACK_GAS_USD: Record<ChainId, number> = {
  ethereum: 5.0,
  bsc: 0.1,
  polygon: 0.05,
  solana: 0.01,
}

export async function estimateGasUsd(chain: ChainId, nativeUsd: number): Promise<number> {
  if (chain === "solana") {
    // Solana lamport fees are tiny; rough placeholder
    return 0.01
  }
  try {
    const rpc = getRpc(chain)
    if (!rpc) return FALLBACK_GAS_USD[chain]
    const provider = new ethers.JsonRpcProvider(rpc)
    const feeData = await provider.getFeeData()
    // Prefer maxFeePerGas if available (EIP-1559), else gasPrice
    const gasPrice = feeData.maxFeePerGas ?? feeData.gasPrice
    if (!gasPrice) return FALLBACK_GAS_USD[chain]
    const gasUnits = GAS_LIMIT_BY_CHAIN[chain]
    const costNative = Number(ethers.formatUnits(gasPrice * BigInt(gasUnits), "ether"))
    return costNative * nativeUsd
  } catch {
    return FALLBACK_GAS_USD[chain]
  }
}
