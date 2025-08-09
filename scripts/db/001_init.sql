-- Postgres schema for persistent storage (optional)
-- Use Neon and set DATABASE_URL. This script can be run via the v0 Scripts runner.

create table if not exists trades (
  id text primary key,
  base text not null,
  quote text not null,
  chain text not null,
  buy_on text not null,
  sell_on text not null,
  size_quote numeric not null,
  pnl_usd numeric not null,
  fees_usd numeric not null,
  gas_usd numeric not null,
  timestamp bigint not null,
  dry_run boolean not null default true,
  tx_hashes text,
  notes text
);

create index if not exists idx_trades_timestamp on trades (timestamp desc);
