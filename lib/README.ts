export const SETUP_STEPS = `
Setup (Summary)
1) Deploy to Vercel (recommended). Environment variables are read server-side.
2) Add RPC URLs:
   - ETHEREUM_RPC_URL, BSC_RPC_URL, POLYGON_RPC_URL, SOLANA_RPC_URL
3) Keep DRY_RUN=true until confident.
4) (Optional) Add DATABASE_URL (Neon Postgres) and run scripts/db/001_init.sql.
5) (Optional) Configure CEX API keys with read-only prices and paper trading first.

.ENV Example (Vercel project envs)
# Thresholds
MIN_DIFF_PCT=0.5
DEFAULT_SIZE_QUOTE=1000
DEX_FEE_PCT=0.30
CEX_TAKER_FEE_PCT=0.10
SLIPPAGE_PCT=0.50
DRY_RUN=true

# RPCs
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/REPLACE
BSC_RPC_URL=https://bsc-dataseed.binance.org
POLYGON_RPC_URL=https://polygon-rpc.com
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Wallets (server-only; NEVER expose to client)
WALLET_PRIVATE_KEY_ETH=0xREPLACE
WALLET_PRIVATE_KEY_BSC=0xREPLACE
WALLET_PRIVATE_KEY_POLYGON=0xREPLACE
SOLANA_PRIVATE_KEY_BASE58=REPLACE

# CEX API (if adding live trade clients)
BINANCE_API_KEY=REPLACE
BINANCE_API_SECRET=REPLACE
KUCOIN_API_KEY=REPLACE
KUCOIN_API_SECRET=REPLACE
KRAKEN_API_KEY=REPLACE
KRAKEN_API_SECRET=REPLACE

# Database (optional)
DATABASE_URL=postgres://USER:PASS@HOST:PORT/DB
`
