# @codex/db

Neon Postgres + Drizzle for codex-w (Better Auth tables + app data).

## Setup

### Local (recommended for dev)

```bash
npm run stack:up   # Postgres 16 on localhost:5432
cp apps/web/.env.example apps/web/.env.local
```

Schema is applied automatically on first container boot (`0000_init.sql`).

See [`.cursor/runbook/05_LOCAL_DEV.md`](../../.cursor/runbook/05_LOCAL_DEV.md).

`@codex/db` uses **postgres.js** for `localhost` URLs and **Neon HTTP** for remote `DATABASE_URL`.

### Neon (preview / production)

1. Create a [Neon](https://neon.tech) project (free tier).
2. Copy the **pooled** connection string into `apps/web/.env.local` as `DATABASE_URL`.
3. Apply schema:

```bash
# Option A — run SQL in Neon SQL editor
cat packages/db/drizzle/0000_init.sql

# Option B — drizzle push (from repo root)
DATABASE_URL="..." npm run db:push --workspace=@codex/db
```

4. Configure Better Auth env vars in `apps/web/.env.local` (see `.env.example`).

## Tables

- `user`, `session`, `account`, `verification` — Better Auth
- `character_sheets` — cloud backup for character sheets (owner-scoped via API)

RLS policies can be added in Neon later; API enforces `owner_id` today.
