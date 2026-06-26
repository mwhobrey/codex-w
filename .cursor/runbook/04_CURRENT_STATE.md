# Current State

> Last updated: 2025-06-26 — UX polish sprint + VTT overlay fixes

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
- [x] **Portrait upload** — local IndexedDB blobs; `portrait_url` in Postgres when signed in; S3 object via `/api/assets`
- [x] **CI/CD** — GitHub Actions: unit tests, web build, Playwright smoke on PR/push to `main`
- [x] **Invite tokens** — PartyKit `4403` gate; multi-source resume (URL, meta, storage, recent)
- [x] **Story integration** — per-system table panels, TYOV tag engine, Ironforge heat, `/library`, table export
- [x] **E2E tests** — smoke (all systems + library) + multiplayer invite (PartyKit in CI)
- [x] **`packages/sync` unit tests** — GM, tokens, fog, invite, export (29 tests)
- [x] **Design system polish** — shadcn `Dialog`/`Sheet` in `@codex/ui`; semantic Tailwind tokens (`primary`, `muted-foreground`, etc.); skip link, reduced-motion, mobile play header
- [x] **Portrait cloud sync** — local IndexedDB blobs + optional S3 upload; `/api/assets/status`; sync on sign-in via `portrait-cloud-sync.ts`
- [x] **Character delete** — local tombstone + cloud `DELETE /api/sheets/:id`; blocks auto-save race and cloud re-merge
- [x] **Map / VTT hardening** — codex scene grouping (`codexSceneId`), river/road path stamps, **Break apart** toolbar; Excalidraw infinite-loop fix on room enter
- [x] **Dice hub** — per-system starter sets (`system-dice-sets.ts`)
- [x] **Library** — Reference + **My tables** tabs; clone reference table → editable local copy (Dexie v5 + Postgres `library_tables`); `/api/library-tables`
- [x] **Sign-out cleanup** — strips invite tokens from recent play rooms only (keeps table names/metadata)
- [x] **Play lobby** — recent tables show human-readable names; character peek hides duplicate Edit CTA
- [x] **Professional UX polish sprint** — Excalidraw play-mode chrome suppression (`.codex-excalidraw-play` CSS, dark zen); unified `TableViewTablist` ARIA; paste-invite join flow (`parseTableInviteInput`); mobile sign-in in nav drawer; `ConfirmDialog` primitive; Radix `Dialog`/`Sheet` for adapt + table info; semantic `--success`/`--warning` tokens; marketing interactivity (feature links, hero dice); dice hub IA reorder; `text-xs` typography floor; page title dedup; `@codex/web` unit tests (`play-room.test.ts`, `excalidraw-viewport.test.ts`)
- [x] **VTT overlay projection** — `useExcalidrawViewport` + `sceneCoordsToViewportCoords` for fog (per-cell viewport rects), tokens, and cursors; rAF sync during zoom; fixes fog drift/resize at non-1× zoom

## What Is Explicitly Not Built Yet

- [ ] `apps/sync-server` — deferred; PartyKit handles MVP multiplayer relay
- [ ] Room squatting hardening (atomic invite seed on PartyKit)
- [ ] Fog / GM server-side enforcement (currently UI-only)
- [ ] Map snapshots to Postgres (Yjs state is local + PartyKit only)
- [ ] Solo session / journal full cloud sync
- [ ] Neon production deploy + PartyKit env on Vercel preview
- [ ] `packages/sync` unit tests — expand excalidraw / play-room provider coverage (`@codex/web` has `play-room` + viewport math tests; root `npm run test` includes `@codex/web`)
- [ ] Dice hub live log push with invite auth

## Immediate Next Steps (Recommended Order)

### Dogfood & harden multiplayer

1. **Two-browser dogfood** — same `roomId` with PartyKit locally; validate tokens, fog split, GM transfer, log merge
2. **PartyKit deploy + env** — `NEXT_PUBLIC_PARTYKIT_HOST` on Vercel preview for internet dogfood
3. **`@codex/sync` unit tests** — expand excalidraw / play-room provider coverage; add package to `npm run test`

### Security & ship

4. **Room security** — server-issued invite tokens before external tables
5. **Neon + Vercel** — production Postgres, auth secrets, PartyKit deploy
6. **Mobile pass** — touch targets, map toolbar on small screens (partially addressed in polish sprint)

### Deferred

- Postgres map snapshots
- `paintFogBrush` UI (exported in sync, unwired)
- `apps/sync-server` / Hocuspocus if PartyKit limits bite

## CI / E2E (local)

```bash
# Mirror CI unit + build
npm install
npm run ci   # includes @codex/web vitest (play-room, viewport math)

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
