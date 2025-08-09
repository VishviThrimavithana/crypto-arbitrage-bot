import type { ChainId } from "./types"

// Minimal ERC20 addresses for USDT, base tokens, and wrapped natives
// Note: Always verify addresses for production use.
export const addresses: Record<
  ChainId,
  {
    USDT: string
    WETH?: string
    WBNB?: string
    WMATIC?: string
    ETH?: string
    BNB?: string
    MATIC?: string
  }
> = {
  ethereum: {
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // placeholder for native
  },
  bsc: {
    USDT: "0x55d398326f99059fF775485246999027B3197955",
    WBNB: "0xBB4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    BNB: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  },
  polygon: {
    USDT: "0xC2132D05D31c914a87C6611C10748AEb04B58e8F",
    WMATIC: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    MATIC: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  },
  solana: {
    // USDT mint address on Solana
    USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    // native SOL is special on Solana
  },
}

// Common DEX Router addresses (V2 style) for quoting
export const routers = {
  ethereum: {
    UniswapV2: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  },
  bsc: {
    PancakeV2: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
  },
  polygon: {
    QuickSwap: "0xa5E0829CaCED8fFDD4De3c43696c57F7D7A678ff",
  },
}
