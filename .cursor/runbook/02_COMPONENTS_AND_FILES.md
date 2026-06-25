# Components & Files

## Monorepo Layout

```
codex-w/
├── apps/
│   ├── web/                 # Next.js 15 — primary user-facing app
│   └── sync-server/         # Hocuspocus Yjs WebSocket server
├── packages/
│   ├── ui/                  # shadcn-based design system + Codex tokens
│   ├── game-engine/         # Dice, RNG, oracles, parsers, roll logs
│   ├── game-systems/        # Per-RPG plugins (loner, totv, snallygaster, …)
│   ├── sync/                # Dexie schemas, Yjs providers, sync queue
│   ├── schemas/             # Shared Zod types, API contracts
│   └── config/              # Shared ESLint, TSConfig, Tailwind presets
├── .cursor/
│   └── runbook/             # This documentation set
├── .cursorrules             # Root agent instructions (runbook protocol)
└── turbo.json               # Turborepo pipeline
```

## App: `apps/web`

| Path | Responsibility |
|------|----------------|
| `app/` | Next.js App Router — layouts, pages, route handlers |
| `app/(marketing)/` | Landing, pricing, docs (SSR) |
| `app/(app)/` | Authenticated app shell |
| `app/(app)/session/[id]/` | Active play session (VTT + tools) |
| `app/(app)/solo/[system]/` | Solo RPG flows |
| `app/api/` | REST/route handlers — sync, auth callbacks |
| `components/` | App-specific composites (not shared UI primitives) |
| `hooks/` | App-level React hooks |
| `lib/` | App utilities, Supabase client, env validation |
| `public/` | Static assets, PWA manifest icons |
| `styles/` | Global CSS, Tailwind entry |

### Key Routes (Planned)

| Route | Feature |
|-------|---------|
| `/` | Marketing landing |
| `/play` | Session lobby |
| `/play/[sessionId]` | Multiplayer / GM session |
| `/solo` | Solo system picker |
| `/solo/[systemId]` | Solo play surface |
| `/characters` | Character sheet manager |
| `/characters/[id]` | Sheet editor |
| `/library` | Oracles, generators, reference |

## App: `apps/sync-server`

| Path | Responsibility |
|------|----------------|
| `src/index.ts` | Hocuspocus server bootstrap |
| `src/extensions/` | Auth, persistence hooks, Postgres snapshot writer |
| `src/rooms/` | Room naming, token validation |

## Package: `packages/ui`

- shadcn/ui components (Button, Dialog, Sheet, etc.)
- Codex design tokens: colors, typography, spacing
- Compound components: `DiceRoller`, `OracleDrawer`, `SessionHeader`
- **Rule:** No business logic; presentation only

## Package: `packages/game-engine`

| Module | Responsibility |
|--------|----------------|
| `dice/` | Parser (e.g. `2d6+3`), roller, advantage/disadvantage |
| `oracles/` | Table resolution, weighted picks, solo prompts |
| `journal/` | Session log entries, timestamps, export |
| `rng/` | Seeded + crypto RNG utilities |

## Package: `packages/game-systems`

One subdirectory per RPG:

```
game-systems/
├── loner/
├── totv/           # Thieves of the Velvet
├── snallygaster/
├── ironforge/
└── generic/        # System-agnostic fallback sheet
```

Each exports a `GameSystemPlugin` (see `01_ARCHITECTURE.md`).

## Package: `packages/sync`

| Module | Responsibility |
|--------|----------------|
| `db/` | Dexie database definitions, migrations |
| `yjs/` | Provider factory (local / websocket), doc types |
| `queue/` | Offline mutation queue, retry with backoff |
| `hooks/` | React hooks: `useSyncedDoc`, `useOfflineStatus` |

## Package: `packages/schemas`

- Zod schemas for API request/response
- Shared TypeScript types inferred from Zod
- Character sheet JSON Schema definitions
- **Single source of truth** — import everywhere, never duplicate types

## Package: `packages/config`

- `eslint/` — shared ESLint flat config
- `typescript/` — base `tsconfig.json` variants
- `tailwind/` — shared Tailwind preset with Codex tokens

## Configuration Locations

| Config | File |
|--------|------|
| Monorepo workspaces | `pnpm-workspace.yaml` |
| Build pipeline | `turbo.json` |
| Root scripts | `package.json` |
| Web env vars | `apps/web/.env.local` (never committed) |
| Web env schema | `apps/web/lib/env.ts` (Zod-validated) |
| Supabase | `supabase/` (migrations, config) — when initialized |
| PWA | `apps/web/next.config.ts` + Serwist config |

## State Management Map

| State type | Tool | Location |
|------------|------|----------|
| Server/async data | TanStack Query | `apps/web/lib/queries/` |
| UI ephemeral | Zustand | `apps/web/stores/` |
| Persistent local | Dexie | `packages/sync/db/` |
| Collaborative | Yjs docs | `packages/sync/yjs/` |
| Form state | React Hook Form + Zod | Colocated in components |
