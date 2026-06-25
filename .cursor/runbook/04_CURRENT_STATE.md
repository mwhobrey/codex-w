# Current State

> Last updated: 2025-06-24 — Phase 1 + Arc A/B in progress

## What Is Working

- [x] Architecture decisions documented (`01_ARCHITECTURE.md`)
- [x] Monorepo structure defined (`02_COMPONENTS_AND_FILES.md`)
- [x] Coding standards established (`03_RULES_AND_STANDARDS.md`)
- [x] Master runbook federated in `.cursor/runbook/`
- [x] Agent runbook protocol in `.cursorrules` + `.cursor/rules/runbook.mdc`
- [x] Root monorepo scaffold (`package.json`, workspaces, `turbo.json`)
- [x] **Git repo** on `main` — initial commit + tracked `apps/web/.env.example`
- [x] **`packages/config`** — shared TSConfig bases + Codex Tailwind design tokens
- [x] **`packages/schemas`** — base Zod types (`User`, `Session`, `CharacterSheet`, `GameSystemId`)
- [x] **`apps/web`** — Next.js 16 bootstrapped with landing page (dark-first, ember gold aesthetic)
- [x] Locked decisions: PartyKit (MVP sync), Loner (first solo), Better Auth + Neon, Vercel hosting

- [x] **`packages/game-engine`** — dice parser, roller, keep/drop, adv/dis, d%/dF (unit tests)
- [x] **Dice hub** at `/dice` — formula builder, saved sets, roll log (`/roll` redirects)
- [x] **`packages/game-systems/generic`** — plugin contract + system-neutral sheet definition + builder v2 (field palette, hide built-ins, custom fields, relabel vitals)
- [x] **`packages/sync`** — Dexie IndexedDB repos (sheets, dice sets, solo sessions)
- [x] **Character sheets UI** at `/characters` + `/characters/[id]` — local CRUD, auto-save, cross-play adapt/move with mapping dialog
- [x] **Cloud sync API** at `/api/sheets`, `/api/dice-sets`, `/api/sync` — Postgres upsert when signed in
- [x] **`packages/game-systems/loner`** — sheet, oracle likelihoods, twist table, scene prompts
- [x] **Solo play** at `/solo` + system routes — oracle engines, journal, scratch notes, scene map panel
- [x] **Cross-play** — `PortableProfile`, `adaptSheetToSystem`, `moveSheetWithMappings`, lineage tracking
- [x] **Session picker** — named sessions, create/switch/delete, `?session=` URL routing
- [x] **Shared `SoloPlaySurface`** — parameterized by `gameSystemId`
- [x] **`packages/game-systems/totv`**, **snallygaster**, **muscadines**, **ironforge** — solo engines + routes
- [x] **Arc A — Play Together (MVP)** — `/play` lobby + `/play/[roomId]` Excalidraw VTT with codex terrain/structure stamps, Yjs + y-indexeddb offline map, PartyKit relay, shared session log, connection status + invite link
- [x] **Arc B (partial)** — Better Auth at `/login`, Drizzle + Docker Postgres local stack (`npm run stack:up`), auto-migrate on `dev:web`
- [x] **`packages/ui`** — shadcn/Radix design system (Button, Input, Card, Badge, etc.)
- [x] **PWA / offline shell** — Serwist SW + manifest + `/~offline` fallback (dev SW disabled)
- [x] **CI/CD pipeline** — GitHub Actions: unit tests, web build, Playwright smoke on PR/push to `main`
- [x] **E2E tests** — Playwright smoke: landing → `/dice` → `/characters` → `/solo/loner`
- [x] **Unit tests** — `game-engine`, `game-systems` (vitest)

## What Is Explicitly Not Built Yet

- [ ] `apps/sync-server` — deferred; PartyKit handles MVP multiplayer relay
- [ ] Room auth / invite tokens (PartyKit rooms are open-link)
- [ ] Map snapshots to Postgres (Yjs state is local + PartyKit only)
- [ ] Fog of war / token layer on VTT
- [ ] Solo session / journal full cloud sync
- [ ] R2/S3 asset pipeline wired in UI (API stub exists)
- [ ] Neon production deploy + env wiring

## Immediate Next Steps (Recommended Order)

### VTT & multiplayer polish

1. **Token stamps** — player/NPC circles on Excalidraw layer
2. **Room security** — server-issued tokens, optional Postgres snapshots
3. **Dice → play room** — push `/dice` results into session log from play surface

### Character & solo

4. **Generic solo engine** — deeper oracle/scene loop for system-neutral play
5. **Mobile pass** — touch targets, map toolbar on small screens

### Ship

6. **Neon + Vercel** — production Postgres, auth secrets, PartyKit deploy
7. **`apps/sync-server`** — Hocuspocus migration if PartyKit limits bite

## CI / E2E (local)

```bash
# Mirror CI unit + build
npm install
npm run ci

# E2E (builds production server automatically unless PLAYWRIGHT_BASE_URL is set)
npm run test:e2e --workspace=@codex/web

# E2E against an already-running dev server
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 npm run test:e2e --workspace=@codex/web
```

Workflow: `.github/workflows/ci.yml` — `npm install` → `npm run test` (game-engine + game-systems) → `npm run build --workspace=@codex/web` → Playwright (Chromium).

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

## Blockers

None — greenfield, ready to build.
