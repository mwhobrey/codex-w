# Current State

> Last updated: 2025-06-24 — Phase 1 + Arc A (Play Together MVP)

## What Is Working

- [x] Architecture decisions documented (`01_ARCHITECTURE.md`)
- [x] Monorepo structure defined (`02_COMPONENTS_AND_FILES.md`)
- [x] Coding standards established (`03_RULES_AND_STANDARDS.md`)
- [x] Master runbook federated in `.cursor/runbook/`
- [x] Agent runbook protocol in `.cursorrules` + `.cursor/rules/runbook.mdc`
- [x] Root monorepo scaffold (`package.json`, workspaces, `turbo.json`)
- [x] **`packages/config`** — shared TSConfig bases + Codex Tailwind design tokens
- [x] **`packages/schemas`** — base Zod types (`User`, `Session`, `CharacterSheet`, `GameSystemId`)
- [x] **`apps/web`** — Next.js 16 bootstrapped with landing page (dark-first, ember gold aesthetic)
- [x] Locked decisions: PartyKit (MVP sync), Loner (first solo), Supabase auth, Vercel hosting

- [x] **`packages/game-engine`** — dice parser, roller, keep/drop, adv/dis, d%/dF (13 unit tests)
- [x] **Dice roller UI** at `/roll` — tactile animation, presets, roll log, aria-live
- [x] **`packages/game-systems/generic`** — plugin contract + system-neutral sheet definition
- [x] **`packages/sync`** — Dexie IndexedDB repo for character sheets
- [x] **Character sheets UI** at `/characters` + `/characters/[id]` — local CRUD, auto-save
- [x] **API stubs** at `/api/sheets` — validation only; cloud sync deferred
- [x] **`packages/game-systems/loner`** — sheet, oracle likelihoods, twist table, scene prompts
- [x] **Solo play** at `/solo` + `/solo/loner` — oracle, risk roll, twists, journal + markdown export
- [x] **Cross-play** — `PortableProfile`, `adaptSheetToSystem`, lineage tracking
- [x] **Session picker** — named sessions, create/switch/delete, `?session=` URL routing
- [x] **Shared `SoloPlaySurface`** — parameterized by `gameSystemId`
- [x] **`packages/game-systems/totv`** — Thousand Year Old Vampire sheet, prompt-journal engine (`d10−d6`), `/solo/totv`
- [x] **`packages/game-systems/snallygaster`** — Camp Snallygaster sheet, Lasers & Feelings engine, `/solo/snallygaster`
- [x] **`packages/game-systems/muscadines`** — Midnight Muscadines sheet, mentor + oracle engine, `/solo/muscadines`
- [x] **`packages/game-systems/ironforge`** — original grim industrial vow-progress engine, `/solo/ironforge`
- [x] **Expanded solo fidelity** — TYOV 36 original prompts + slot tracking; Snallygaster d12 problems/activities + camp weeks; Muscadines folklore tables + 12 mentor prompts
- [x] **Arc A — Play Together (MVP)** — `/play` lobby + `/play/[roomId]` tldraw VTT, Yjs + y-indexeddb offline map, PartyKit Yjs relay (`apps/partykit`), shared session log (rolls + journal via Y.Array), connection status + invite link, header/hero nav

## What Is Explicitly Not Built Yet

- [ ] `apps/sync-server` — deferred; PartyKit handles MVP multiplayer relay
- [x] **`packages/ui`** — shadcn/Radix design system (Button, Input, Card, Badge, etc.)
- [x] **Cross-play** — `PortableProfile`, `adaptSheetToSystem`, lineage tracking on sheets
- [x] **Loner play character link** — picker + active character panel in `/solo/loner`
- [ ] Supabase project + migrations
- [ ] Authentication flow
- [ ] Room auth / invite tokens (PartyKit rooms are open-link)
- [ ] `/roll` → play room log bridge (manual roll+log in room UI works; standalone `/roll` not wired)
- [ ] **Arc B (in progress)** — Neon + Better Auth; character sheet cloud upsert when signed in
- [ ] Solo session / journal cloud sync
- [ ] R2 asset storage (map exports, portraits)
- [x] **PWA / offline shell** — Serwist SW + manifest + `/~offline` fallback (dev SW disabled; see limitations below)
- [x] **CI/CD pipeline** — GitHub Actions: unit tests, web build, Playwright smoke on PR/push to `main`
- [x] **E2E tests** — Playwright smoke: landing → `/roll` → `/characters` → `/solo/loner`
- [x] **Unit tests** — `game-engine` (13), `game-systems` (vitest)

## Immediate Next Steps (Recommended Order)

### Phase 0 — Foundation (remaining)

1. ~~Bootstrap `apps/web`~~ ✓
2. ~~Initialize `packages/config`~~ ✓
3. **Initialize `packages/ui`** — shadcn init, compound components
4. ~~Initialize `packages/schemas`~~ ✓
5. **Fix package manager** — pnpm preferred (`packageManager` field set); currently npm workspaces due to env permissions

### Phase 1 — Core Loop (in progress)

6. ~~**`packages/game-engine`** — dice parser + roller~~ ✓
7. ~~**Dice UI** in web app~~ ✓
8. ~~**`packages/game-systems/generic`** — minimal universal character sheet~~ ✓
9. ~~**Character sheet CRUD** — Dexie local + API stub~~ ✓
10. ~~**`packages/game-systems/loner`** — solo plugin + oracle UI~~ ✓
11. ~~**Solo play surface** — `/solo/loner` flow~~ ✓
12. ~~**Session picker + TOTV**~~ ✓

### Phase 3 — Maps & Multiplayer (Weeks 5–6)

13. ~~**tldraw integration** — `/play/[roomId]` canvas~~ ✓ (Arc A MVP)
14. ~~**PartyKit Yjs relay** — `apps/partykit`~~ ✓
15. ~~**`packages/sync` Yjs providers** — y-indexeddb + y-partykit~~ ✓
16. **`apps/sync-server`** — Hocuspocus + room auth (optional migration off PartyKit)
17. **Room security** — server-issued tokens, Postgres snapshots

### Phase 4 — Polish & Ship (Week 7+)

16. **Supabase** — auth, Postgres schema, RLS, storage
17. ~~**PWA** — Serwist, offline shell~~ ✓ (minimal shell; full offline data paths still Dexie-only)
18. ~~**CI/CD** — GitHub Actions + Vercel~~ ✓ (Actions; Vercel deploy wiring still manual)
20. ~~**E2E tests** — Playwright critical paths~~ ✓ (smoke path)

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

Workflow: `.github/workflows/ci.yml` — `npm install` → `npm run test` (game-engine + game-systems only; `partykit` workspace name collides with its npm dep) → `npm run build --workspace=@codex/web` → Playwright (Chromium).

## PWA notes

- **Serwist** via `@serwist/next` in `apps/web/next.config.ts`; SW source `app/sw.ts`, output `public/sw.js` (gitignored).
- **Production build uses webpack** (`next build --webpack`) because Serwist injects a webpack plugin; Next 16 defaults to Turbopack.
- **Service worker disabled in development** (`NODE_ENV === 'development'`) because Turbopack dev conflicts with Serwist precache. Test PWA after `npm run build --workspace=@codex/web && npm run start --workspace=@codex/web`.
- **Offline fallback** at `/~offline` for uncached document navigations.
- **Icons** generated by `node apps/web/scripts/generate-pwa-icons.mjs` (requires `sharp` from Next.js).
- **Not yet**: background sync, push, or full app-shell precache of all solo routes — shell + `defaultCache` runtime caching only.

## Locked Decisions

| Decision | Choice | Notes |
|----------|--------|-------|
| Repo / package name | **codex-w** | Product display name TBD (see `00_INDEX.md`) |
| First solo system | **Loner** | MVP oracle plugin |
| Sync host (MVP) | **PartyKit** | Managed Yjs relay; migrate to self-hosted Hocuspocus if ops needs grow |
| Auth provider | **Better Auth** + Neon | Self-hosted; $0 MAU; replaces Supabase Auth in runbook |
| Primary DB | **Neon Postgres** | Drizzle; character sheet backup MVP |
| Hosting | **Vercel** | Next.js native |

## Blockers

None — greenfield, ready to build.
