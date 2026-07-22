# AGENTS.md

## Cursor Cloud specific instructions

Codex is a Turborepo + **npm workspaces** monorepo (`apps/*`, `packages/*`). The product is the Next.js web app in `apps/web` (`@codex/web`). Standard commands live in root `package.json` scripts and `.cursor/runbook/05_LOCAL_DEV.md`; prefer those. Notes below are the non-obvious gotchas.

### Package manager
- Use **npm** (there is a `package-lock.json` and `"packageManager": "npm@11.6.1"`). A stray `pnpm-workspace.yaml` exists but is misleading — do **not** run `pnpm`/`yarn`.

### Services & ports
- Web app (`npm run dev:web`) → http://localhost:3000. This is offline-first and works standalone (dice, oracles, character sheets, VTT) with **no** backend, storing to IndexedDB.
- Sync relay (`npm run dev:sync`, Hocuspocus/Yjs) → `ws://127.0.0.1:1999`. Only needed for multiplayer `/play`. Its HTTP root returns 404 by design — that is healthy, not an error.
- Postgres (Docker) → host port **5433** (not 5432). Only needed for auth (`/login`) and cloud sync/persistence.

### Enabling auth + cloud sync (Postgres)
- Requires Docker. Docker is **not running on a fresh VM boot** — start it first. The daemon is pre-configured in `/etc/docker/daemon.json` with the `fuse-overlayfs` storage driver and `containerd-snapshotter: false` (required for Docker 29 + fuse-overlayfs in this VM). If those settings or the Docker install are missing, recreate them before starting.
- Start the daemon in the background (needs root), then make the socket usable without sudo:
  - `sudo dockerd` (run detached, e.g. in a tmux session)
  - `sudo chmod 666 /var/run/docker.sock`
- Then `npm run stack:up` starts Postgres and applies all `packages/db/drizzle/*.sql` migrations (idempotent). `npm run dev` and `npm run dev:web` also call this automatically and **skip gracefully if Docker is unavailable** (app then runs offline-only; auth APIs return 503).
- First run only: `cp apps/web/.env.example apps/web/.env.local` and set `BETTER_AUTH_SECRET` (`openssl rand -base64 32`). Without `DATABASE_URL`/`BETTER_AUTH_*` in `.env.local`, auth returns 503.

### Lint / typecheck caveats (pre-existing, not environment issues)
- `npm run lint` runs but `@codex/web` currently reports pre-existing ESLint errors (mostly `react-hooks/set-state-in-effect`).
- `npm run typecheck` runs but `@codex/db` has a pre-existing `rootDir` error for `drizzle.config.ts`.
- These are code issues in the repo, not setup problems. `npm test` (Vitest) and `npm run build` both pass.

### Testing
- `npm test` — Vitest across game-engine, game-systems, sync, web. `npm run test:e2e` — Playwright in `apps/web` (may need `npx playwright install`).
