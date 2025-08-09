import { ethers } from "ethers"
import { getRpc } from "./config"
import { ERC20_ABI, UNISWAP_V2_ROUTER_ABI } from "./abi"
import { addresses, routers } from "./chains"
import type { ChainId } from "./types"

async function getProvider(chain: ChainId) {
  const rpc = getRpc(chain)
  if (!rpc) throw new Error(`Missing RPC for ${chain}`)
  return new ethers.JsonRpcProvider(rpc)
}

async function getDecimals(chain: ChainId, token: string) {
  if (token.toLowerCase() === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
    // native, use 18 for EVM
    return 18
  }
  const provider = await getProvider(chain)
  const erc20 = new ethers.Contract(token, ERC20_ABI, provider)
  const d: number = await erc20.decimals()
  return d
}

function toAddress(tokenAddr?: string) {
  if (!tokenAddr) throw new Error("Token address missing")
  return tokenAddr
}

export async function getDexPriceV2(params: {
  chain: ChainId
  dex: "UniswapV2" | "PancakeV2" | "QuickSwap"
  base: string // symbol e.g., ETH/BNB/MATIC
  quote: string // symbol e.g., USDT
}): Promise<number> {
  const { chain, dex, base, quote } = params
  const provider = await getProvider(chain)
  const routerAddress = (routers as any)[chain]?.[dex]
  if (!routerAddress) throw new Error(`Router missing for ${chain}:${dex}`)
  const router = new ethers.Contract(routerAddress, UNISWAP_V2_ROUTER_ABI, provider)

  // Resolve token addresses
  let baseAddr: string
  let quoteAddr: string

  if (chain === "ethereum") {
    baseAddr = base === "ETH" ? toAddress(addresses.ethereum.WETH) : (addresses.ethereum as any)[base]
    quoteAddr = (addresses.ethereum as any)[quote]
  } else if (chain === "bsc") {
    baseAddr = base === "BNB" ? toAddress(addresses.bsc.WBNB) : (addresses.bsc as any)[base]
    quoteAddr = (addresses.bsc as any)[quote]
  } else if (chain === "polygon") {
    baseAddr = base === "MATIC" ? toAddress(addresses.polygon.WMATIC) : (addresses.polygon as any)[base]
    quoteAddr = (addresses.polygon as any)[quote]
  } else {
    throw new Error("Unsupported EVM chain for V2 quoting")
  }

  const baseDec = await getDecimals(chain, baseAddr)
  const quoteDec = await getDecimals(chain, quoteAddr)

  // Quote 1 base unit
  const amountIn = ethers.parseUnits("1", baseDec)
  const path = [baseAddr, quoteAddr]
  const amounts: bigint[] = await router.getAmountsOut(amountIn, path)
  const out = amounts[amounts.length - 1]
  const price = Number(ethers.formatUnits(out, quoteDec)) // quote per base
  return price
}
