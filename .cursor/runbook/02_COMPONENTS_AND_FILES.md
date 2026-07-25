# Components & Files

## Monorepo Layout

```
codex-w/
├── apps/
│   ├── web/                 # Next.js 16 — primary user-facing app
│   ├── sync-server/         # Hocuspocus Yjs WebSocket server
│   └── partykit/            # Legacy relay (superseded; keep for reference)
├── packages/
│   ├── ui/                  # shadcn primitives + Codex token mapping
│   ├── game-engine/         # Dice, RNG, oracles, parsers
│   ├── game-systems/        # Per-RPG plugins (loner, totv, snallygaster, …)
│   ├── sync/                # Dexie repos + Yjs play-room primitives
│   ├── db/                  # Drizzle / Postgres access (web API + sync-server)
│   ├── schemas/             # Shared Zod types, API contracts
│   └── config/              # Shared TSConfig + Tailwind tokens
├── .cursor/
│   └── runbook/             # This documentation set
├── .cursorrules             # Root agent instructions (runbook protocol)
├── package.json             # npm workspaces + root scripts
└── turbo.json               # Turborepo pipeline
```

## App: `apps/web`

| Path | Responsibility |
|------|----------------|
| `app/` | Next.js App Router — flat routes, layouts, pages, route handlers |
| `app/api/` | REST/route handlers — sheets, dice, sync, auth, assets, rooms |
| `components/` | App-specific composites (dice hub, play panels, marketing) |
| `hooks/` | App-level React hooks (play room, Yjs fog/tokens, etc.) |
| `lib/` | Env, auth client, best-effort cloud push helpers, play-room utils |
| `public/` | Static assets, PWA manifest icons |

### Key Routes

| Route | Feature |
|-------|---------|
| `/` | Marketing landing |
| `/play` | Table lobby |
| `/play/[roomId]` | Unified solo/multiplayer table (VTT + tools) |
| `/solo`, `/solo/[system]` | Legacy redirects → `/play?system=…` |
| `/characters` | Character sheet manager |
| `/characters/[id]` | Sheet editor |
| `/dice` | Dice hub (`/roll` redirects here) |
| `/journal` | Cross-table journal search |
| `/library` | Reference tables + user-owned clones |
| `/login` | Better Auth sign-in |

## App: `apps/sync-server`

| Path | Responsibility |
|------|----------------|
| `src/index.ts` | Hocuspocus server bootstrap + Database extension |
| `src/yjs-database.ts` | Postgres fetch/store for Yjs docs |
| `src/invite-store.ts` | Durable room invites (`room_invites`) with memory fallback |
| `src/http-routes.ts` | Invite seed HTTP + websocket admission |
| `src/*-guard.ts` | Fog / log / kick write guards |

## Package: `packages/ui`

- shadcn/ui primitives (Button, Dialog, Sheet, Card, Input, …)
- Semantic tokens mapped to Codex palette (`styles.css`)
- **Rule:** No business logic; presentation only
- Compound product UI (DiceRoller, play panels, etc.) lives in `apps/web/components`

## Package: `packages/game-engine`

| Module | Responsibility |
|--------|----------------|
| `dice/` | Parser (e.g. `2d6+3`), roller, advantage/disadvantage |
| `oracles/` | Table resolution, weighted picks, solo prompts |
| `rng/` | Seeded + crypto RNG utilities |

## Package: `packages/game-systems`

One subdirectory per RPG:

```
game-systems/
├── loner/
├── paranormal-files/
├── totv/
├── snallygaster/
├── muscadines/
├── ironsworn/
└── generic/
```

Each exports a `GameSystemPlugin` (see `01_ARCHITECTURE.md`). Static registry in `registry.ts`.

## Package: `packages/sync`

| Module | Responsibility |
|--------|----------------|
| `db.ts` + repos | Dexie database definitions, migrations, entity repos |
| `yjs/` | Play-room doc, providers (IndexedDB + Hocuspocus), fog/tokens/meta/guards |

Cloud entity push helpers live in `apps/web/lib/*-sync.ts` and enqueue to Dexie `cloudMutationQueue` (`@codex/sync`) when offline or the request fails. `CloudSyncProvider` flushes after sign-in pull and on `online`.

## Package: `packages/db`

- Drizzle schema + client (Neon serverless / local `postgres`)
- CRUD helpers for sheets, dice sets, sessions, rooms, library tables, Yjs docs, invites
- Used by Next.js API routes and `apps/sync-server` only (not client-bundled for data)

## Package: `packages/schemas`

- Zod schemas for API request/response and shared domain types
- **Single source of truth** — import everywhere, never duplicate types

## Package: `packages/config`

- `typescript/` — base `tsconfig.json` variants
- `tailwind/` — Codex design tokens CSS

## Configuration Locations

| Config | File |
|--------|------|
| Monorepo workspaces | root `package.json` (`workspaces`) |
| Build pipeline | `turbo.json` |
| Root scripts | `package.json` |
| Web env vars | `apps/web/.env.local` (never committed) |
| Web env schema | `apps/web/lib/env.ts` (Zod-validated) |
| PWA | `apps/web/next.config.ts` + Serwist config |

## State Management Map

| State type | Tool | Location |
|------------|------|----------|
| Persistent local | Dexie + `useLiveQuery` | `packages/sync` repos; hooks in `apps/web` |
| Collaborative | Yjs docs | `packages/sync/yjs/`; play hooks |
| UI ephemeral | `useState` / context | Colocated in components |
| Cloud backup | Best-effort push + durable `cloudMutationQueue` + `GET /api/sync` | `apps/web/lib/*-sync.ts`, `cloud-sync.ts`, `@codex/sync` queue |
