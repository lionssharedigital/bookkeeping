# Lion's Share Digital — Bookkeeping

Self-hosted bookkeeping app: transactions, a category map, CSV/PDF bank
statement import, and P&L / Balance Sheet reports computed from your
transaction data.

## Stack

Next.js (App Router) + TypeScript, SQLite via Drizzle ORM, single Docker
container.

## Running with Docker (recommended)

1. Copy `.env.example` to `.env` and set `ADMIN_PASSWORD` and
   `SESSION_SECRET` (a long random string).
2. `docker compose up --build`
3. Open `http://localhost:3000` and sign in with `ADMIN_PASSWORD`.

The SQLite database lives in a Docker-managed named volume (`sqlite_data`)
and uploaded CSV/PDF files in `./uploads` (a regular bind mount), so both
persist across container restarts/rebuilds. The database uses a named
volume rather than a bind mount because SQLite's file locking isn't
reliably supported over Docker Desktop's virtualized bind-mount filesystem
on macOS. On first boot the app auto-migrates the schema and seeds the
Category Map (imported from the original spreadsheet) and the ten known
Relay/Chase accounts with $0 opening balances — set real opening balances
under **Accounts** before importing transactions.

To back up the database: `docker run --rm -v bookkeeping_sqlite_data:/data -v "$(pwd)":/backup alpine cp /data/bookkeeping.sqlite /backup/bookkeeping-backup.sqlite`
(volume name may be prefixed differently depending on your project/folder name — check with `docker volume ls`).

If this is exposed beyond your local network, put it behind a reverse proxy
(Caddy, Traefik, nginx) for TLS — the app itself only serves plain HTTP.

## Running locally without Docker

```bash
npm install
cp .env.example .env.local   # set ADMIN_PASSWORD and SESSION_SECRET
npm run db:migrate
npm run db:seed
npm run dev
```

## How it works

- **Category Map** (`/categories`): payee keyword → category → type rules.
  New transactions are auto-categorized by case-insensitive substring match
  against these rules (same logic as the original spreadsheet's SEARCH
  lookup), highest-priority rule wins on overlaps.
- **Transactions** (`/transactions`): manual entry with live category
  auto-suggest as you type the payee, inline editing, filtering.
- **Import** (`/import`): upload a CSV or PDF bank statement. You map
  columns (CSV) or the app extracts a table (PDF, best-effort — works well
  for text-based statements, not scanned images), then review
  auto-categorization and duplicate flags before committing. Nothing is
  written to the ledger until you commit.
- **Reports** (`/reports/*`): P&L (category × month) and Balance Sheet
  (opening balance + activity per account) are computed live from
  transactions, not separately maintained — they can't drift out of sync.
  Transfer-type transactions are excluded from P&L (to avoid double-counting
  money moved between your own accounts) but still count toward each
  account's Balance Sheet activity.

## Scripts

- `npm run db:generate` — generate a new Drizzle migration after editing `db/schema.ts`
- `npm run db:migrate` — apply migrations
- `npm run db:seed` — seed/re-seed the Category Map and known accounts (idempotent)
- `npm run lint` — ESLint
