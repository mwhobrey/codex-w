# Local Development

> Run the full codex-w stack on your machine before deploying or dogfooding on a domain.

## Philosophy

| Run on host | Run in Docker |
|-------------|---------------|
| Next.js (`npm run dev:web`) | Postgres |
| Sync relay (`npm run dev:sync`) | *(optional: bundled MinIO via `docker-compose.minio.yml`)* |
| **Your existing MinIO** (`:9000`) | — |

Do **not** containerize Next.js for day-to-day dev — Turbopack is faster on the host. Docker is for **dependencies** (Postgres), not the app.

Neon in production, **Postgres in Docker** locally. Same Drizzle schema; `@codex/db` auto-picks `postgres.js` for `localhost` and Neon HTTP driver for remote URLs.

## Quick start

```bash
# 1. Dependencies
npm install

# 2. Postgres (MinIO: use your existing instance on :9000 — not in compose)
#    `npm run dev` / `dev:web` / `stack:up` start Postgres and apply migrations automatically.
npm run stack:up   # or skip if you only use `npm run dev:web`

# 3. Env (first time)
cp apps/web/.env.example apps/web/.env.local
# Edit BETTER_AUTH_SECRET if you like: openssl rand -base64 32

# 4. Three terminals (or two if skipping multiplayer)
npm run dev:web          # http://localhost:3000
npm run dev:sync          # ws://127.0.0.1:1999 — optional for /play
```

### Verify Arc B locally

1. Open http://localhost:3000/login — create an account
2. Create a character at `/characters`
3. Check Postgres: `npm run stack:psql` → `SELECT id, name, portrait_url FROM character_sheets;`

### Verify Arc A locally

1. Sync relay running (`npm run dev:sync`)
2. Open `/play` → create room → open invite link in second tab
3. Draw on map; entries appear in session log

## Stack commands

| Command | Purpose |
|---------|---------|
| `npm run stack:up` | Start Postgres + apply pending SQL migrations |
| `npm run stack:migrate` | Apply migrations only (Postgres must already be running) |
| `npm run stack:down` | Stop Postgres |
| `npm run stack:reset` | Wipe volume + re-init schema |
| `npm run stack:psql` | psql shell into local DB |
| `npm run dev:web` | Next.js dev server (**webpack** — matches production; avoids Turbopack HMR flicker) |
| `npm run dev:sync` | Yjs relay (Hocuspocus) |
| `npm run dev:partykit` | Alias for `dev:sync` |

## When to use Neon vs Docker

| Situation | Use |
|-----------|-----|
| Daily local dev | Docker Postgres |
| CI | No DB (API returns 503; tests use Dexie) |
| Preview deploy / dogfood domain | Neon branch or project |
| Production | Neon + Vercel env vars |

You do **not** need a Neon account to finish Arc B locally.

## Finishing Arc B before dogfood

Cloud sync (local-testable with Docker):

1. ~~Cloud → local sheet pull on login (merge IndexedDB)~~
2. ~~Solo session / journal cloud backup~~
3. ~~MinIO for assets~~ — use **your existing MinIO**; set `S3_*` in `.env.local`

### MinIO (existing instance)

`npm run stack:up` does **not** start MinIO. Point `apps/web/.env.local` at whatever you already run on `:9000`:

```bash
mc mb local/codex-assets --ignore-existing   # once, if the bucket doesn't exist
```

No MinIO at all? Use `docker compose -f docker-compose.yml -f docker-compose.minio.yml up -d` (ports **19000** / **19001**).

Dogfooding on a domain is **deploy + Neon env vars** — same code, different `DATABASE_URL` / `S3_*`.

## Troubleshooting

- **Page flicker / repeated GET requests in dev** — use `npm run dev:web` (webpack, not Turbopack). Hard-refresh once to clear a stale Serwist service worker; dev auto-unregisters SW on load.

- **Auth 503** — `DATABASE_URL` or `BETTER_AUTH_*` missing in `apps/web/.env.local`
- **Port 5433 in use** — change compose host port or stop the conflicting service
- **Port 5432 already has Postgres** — codex uses **5433** by default to avoid clashing with a host install
- **Schema drift** — `npm run stack:reset` or apply `packages/db/drizzle/0001_solo.sql` via `npm run stack:psql`
- **MinIO port conflict** — compose no longer binds :9000; use your existing MinIO or optional `docker-compose.minio.yml` on :19000
- **Relay offline badge** — start `npm run dev:sync`; map still works via y-indexeddb
