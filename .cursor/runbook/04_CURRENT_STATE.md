# Current State

> Last updated: 2025-06-24 — Arc A multiplayer polish shipped; dogfood next

## What Is Working

- [x] Architecture decisions documented (`01_ARCHITECTURE.md`)
- [x] Monorepo structure defined (`02_COMPONENTS_AND_FILES.md`)
- [x] Coding standards established (`03_RULES_AND_STANDARDS.md`)
- [x] Master runbook federated in `.cursor/runbook/`
- [x] Agent runbook protocol in `.cursorrules` + `.cursor/rules/runbook.mdc`
- [x] Root monorepo scaffold (`package.json`, workspaces, `turbo.json`)
- [x] **Git repo** on `main`
- [x] **`packages/config`** — shared TSConfig bases + Codex Tailwind design tokens
- [x] **`packages/schemas`** — Zod types (`CharacterSheet`, `TableMeta`, `GameSystemId`, etc.)
- [x] **`apps/web`** — Next.js 16, dark-first landing, PWA shell (Serwist)
- [x] Locked decisions: PartyKit (MVP sync), Loner (first solo), Better Auth + Neon, Vercel hosting

- [x] **`packages/game-engine`** — dice parser, roller, oracles (unit tests)
- [x] **Dice hub** at `/dice` — formula builder, saved sets, roll log (`/roll` redirects)
- [x] **`packages/game-systems`** — generic + loner, totv, snallygaster, muscadines, ironforge (unit tests)
- [x] **`packages/sync`** — Dexie repos + Yjs play-room primitives (meta, log, fog, tokens, import)
- [x] **Character sheets UI** at `/characters` + `/characters/[id]` — local CRUD, auto-save, cross-play adapt/move
- [x] **Cloud sync API** at `/api/sheets`, `/api/dice-sets`, `/api/sync` — Postgres upsert when signed in
- [x] **Unified play table** at `/play` + `/play/[roomId]` — solo + multiplayer share one surface
- [x] **Legacy `/solo/*` routes** — redirect to `/play?system=…` for bookmarks
- [x] **VTT** — Excalidraw canvas, codex stamps, scene templates, floating map toolbar
- [x] **Yjs sync** — y-indexeddb offline + PartyKit relay (`apps/partykit`)
- [x] **Awareness** — presence, remote cursors, per-player character binding, account display names
- [x] **Player tokens** — Yjs-synced circles, GM move-any, resize/snap, portraits, fog visibility
- [x] **Fog of war** — GM paint/reveal/clear; player vision; GM local “preview as player”
- [x] **Host-owned GM** — `gmUserId` in table meta, first-claim, Pass GM transfer
- [x] **Embedded journals** — TYOV, Snallygaster, Ironforge panels in play sidebar
- [x] **Invite + import** — copy invite link with system seed; Dexie solo session → table import
- [x] **Dice → play room** — in-room rolls + `/dice?room=` push to session log
- [x] **Arc B (partial)** — Better Auth at `/login`, Drizzle + Docker Postgres (`npm run stack:up`)
- [x] **`packages/ui`** — shadcn/Radix design system
- [x] **CI/CD** — GitHub Actions: unit tests, web build, Playwright smoke on PR/push to `main`
- [x] **E2E tests** — Playwright smoke: landing → `/dice` → `/characters` → `/play?system=loner` (presence, peek, TYOV panel)

## What Is Explicitly Not Built Yet

- [ ] `apps/sync-server` — deferred; PartyKit handles MVP multiplayer relay
- [ ] Room auth / invite tokens (PartyKit rooms are open-link)
- [ ] Map snapshots to Postgres (Yjs state is local + PartyKit only)
- [ ] Solo session / journal full cloud sync
- [ ] R2/S3 / MinIO asset pipeline wired in UI (portrait upload needs storage)
- [ ] Neon production deploy + PartyKit env on Vercel preview
- [ ] `packages/sync` unit tests (GM, tokens, fog primitives untested)
- [ ] Multiplayer E2E (2-browser / PartyKit in CI)

## Immediate Next Steps (Recommended Order)

### Dogfood & harden multiplayer

1. **Two-browser dogfood** — same `roomId` with PartyKit locally; validate tokens, fog split, GM transfer, log merge
2. **Playwright 2-context test** — automate multiplayer smoke in CI (requires PartyKit in workflow or mock)
3. **PartyKit deploy + env** — `NEXT_PUBLIC_PARTYKIT_HOST` on Vercel preview for internet dogfood
4. **`@codex/sync` unit tests** — `claimTableGmIfVacant`, `transferTableGm`, token/fog helpers; add package to `npm run test`

### Security & ship

5. **Room security** — server-issued invite tokens before external tables
6. **Neon + Vercel** — production Postgres, auth secrets, PartyKit deploy
7. **Mobile pass** — touch targets, map toolbar on small screens

### Deferred

- Postgres map snapshots
- `paintFogBrush` UI (exported in sync, unwired)
- `apps/sync-server` / Hocuspocus if PartyKit limits bite

## CI / E2E (local)

```bash
# Mirror CI unit + build
npm install
npm run ci

# E2E (builds production server automatically unless PLAYWRIGHT_BASE_URL is set)
npm run test:e2e --workspace=@codex/web

# Multiplayer dogfood (two terminals)
npm run dev:partykit
npm run dev:web
```

Workflow: `.github/workflows/ci.yml` — `npm install` → `npm run test` (game-engine + game-systems) → `npm run build --workspace=@codex/web` → Playwright (Chromium). **PartyKit is not started in CI** — rooms fall back to y-indexeddb only.

## PWA notes

- **Serwist** via `@serwist/next` in `apps/web/next.config.ts`; SW source `app/sw.ts`, output `public/sw.js` (gitignored).
- **Production build uses webpack** (`next build --webpack`) because Serwist injects a webpack plugin.
- **Service worker disabled in development** — test PWA after `npm run build --workspace=@codex/web && npm run start --workspace=@codex/web`.
- **Offline fallback** at `/~offline` for uncached document navigations.

## Locked Decisions

| Decision | Choice | Notes |
|----------|--------|-------|
| Repo / package name | **codex-w** | Product display name TBD (see `00_INDEX.md`) |
| First solo system | **Loner** | MVP oracle plugin |
| Sync host (MVP) | **PartyKit** | Managed Yjs relay |
| VTT canvas | **Excalidraw** | MIT; replaced tldraw (commercial license risk) |
| Auth provider | **Better Auth** + Neon | Self-hosted; local Docker Postgres for dev |
| Primary DB | **Neon Postgres** | Drizzle; sheet/dice/session backup when signed in |
| Hosting | **Vercel** | Next.js native |
| GM model | **Host-owned meta** | `gmUserId` first-claim; Pass GM transfer; no voting |

## Blockers

None for local dogfood. Internet multiplayer dogfood blocked on PartyKit deploy + env wiring.
