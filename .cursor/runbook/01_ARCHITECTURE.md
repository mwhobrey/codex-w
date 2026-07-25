# Architecture

## Tech Stack

### Client (Primary Surface)

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Language | **TypeScript 5.x** | End-to-end type safety; shared schemas with backend |
| Framework | **Next.js 16** (App Router, React 19) | SSR/SSG where useful, API routes, excellent DX, Vercel-ready |
| Styling | **Tailwind CSS v4** + **shadcn/ui** (Radix) | Accessible primitives, fast iteration, consistent design tokens |
| Motion | **CSS transitions** (+ optional Framer Motion later) | Polished micro-interactions without jank |
| Canvas / VTT | **Excalidraw** (`@excalidraw/excalidraw`) | MIT license; embed + custom stamps via `customData`; Yjs scene sync |
| Local DB | **Dexie.js** (IndexedDB) | Structured offline storage for sheets, sessions, assets metadata |
| CRDT sync | **Yjs** + **y-indexeddb** | Conflict-free merge for maps, shared notes, live cursors |
| Client state | **Dexie live queries** + **React state** + **Yjs** | Instant local reads; ephemeral UI in components; collaborative docs via CRDT |
| Validation | **Zod** | Runtime + compile-time contracts |
| PWA | **Serwist** (Workbox successor) | Offline shell, asset caching, installable |

### Server & Infrastructure

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Primary DB | **PostgreSQL** (Neon prod / Docker local) via **`@codex/db`** (Drizzle) | Relational truth for users, sheets, sessions, asset refs, Yjs docs |
| Auth | **Better Auth** + Drizzle adapter | Self-hosted; httpOnly cookies; no per-MAU tax |
| Object storage | **S3-compatible** (MinIO local, R2/S3 prod) | Map exports, character portraits, custom assets |
| Realtime | **Hocuspocus** (`apps/sync-server`) | Self-hosted Yjs WebSocket relay on VPS |
| Edge / API | Next.js Route Handlers | Thin server; heavy logic stays client-side |
| Monorepo | **Turborepo** + **npm workspaces** | Shared packages, fast CI caches |

### Deferred / Phase 2

| Layer | Choice | When |
|-------|--------|------|
| Desktop shell | **Tauri 2** | Native install, deeper filesystem, optional |
| Mobile | **Expo** (shared `packages/*`) | Post-MVP if demand exists |
| Full SQL sync | **Electric SQL** or **PowerSync** | If Dexie→Postgres replication becomes painful |
| — | — | Durable cloud mutation queue is live (`cloudMutationQueue`) |

## System Design Patterns

### Local-First with Eventual Sync

```
┌─────────────┐     write      ┌──────────────┐
│   React UI  │ ──────────────►│ IndexedDB    │
└─────────────┘                │ (Dexie)      │
       │                       └──────┬───────┘
       │                              │
       ▼                              ▼
┌─────────────┐   Yjs doc     ┌──────────────┐
│ Excalidraw  │ ◄────────────►│ y-indexeddb  │
│  canvas     │               └──────┬───────┘
└─────────────┘                      │
                                     ▼
                              ┌──────────────┐
                              │ Hocuspocus   │
                              │ sync-server  │
                              └──────┬───────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │ PostgreSQL   │
                              │ yjs_documents│
                              └──────────────┘
```

- **Reads** always hit local first → instant UI
- **Writes** go to local immediately → optimistic UX
- **Cloud entity push** (sheets, dice sets, …): best-effort `fetch` when signed in; on failure/offline → Dexie `cloudMutationQueue`; `CloudSyncProvider` flushes after `GET /api/sync` pull and on reconnect
- **CRDT** handles concurrent map/note edits without merge hell

### Plugin Architecture (Game Systems)

Each RPG is a `packages/game-systems/<system>/` plugin implementing:

```typescript
interface GameSystemPlugin {
  id: GameSystemId;              // e.g. "loner", "totv"
  name: string;
  tagline: string;
  sheetDefinition: SheetDefinition;
  soloEngine?: SoloEngineConfig; // discriminated by `kind`
  dicePresets?: DicePreset[];
  rulesPrimer?: string[];
  createEmptySheet: (name: string, ownerId: string) => CharacterSheet;
}
```

Plugins are registered statically in `registry.ts`. Play UI panels live in `apps/web` and route via `resolveTablePanelId(soloEngine.kind)`.

### Session Model

| Mode | Behavior |
|------|----------|
| **Solo** | Single user, local-only or optional cloud backup |
| **Hosted** | GM owns room (`gmUserId`); players join via invite link |
| **Peer** | All clients equal; Yjs room, no dedicated GM server |

Permissions: app-layer ownership checks in API routes (`@codex/db`) + invite admission / fog–log–kick guards on the relay + client awareness.

## Data Flow

### Character Sheet

1. User edits field → Zod validate → Dexie write (instant)
2. Best-effort cloud push → `PUT /api/sheets/:id` → Postgres upsert (when signed in)
3. On sign-in → `GET /api/sync` merges cloud → Dexie

### VTT Map

1. Excalidraw `onChange` → debounced Yjs `excalidraw-elements` array → y-indexeddb persist
2. Online → Hocuspocus broadcasts to room peers
3. Relay persists doc bytes to Postgres `yjs_documents`

### Dice / Oracle Roll

1. Client-side RNG (crypto.getRandomValues) — trust-but-verify optional log
2. Roll event appended to session / play-room log (Yjs or Dexie)
3. Solo oracle → `game-engine` resolves table lookup locally

### Asset Upload

1. Client compresses image → S3-compatible storage (when online)
2. Metadata + URL stored in Dexie; portrait cloud sync on sign-in when configured
3. Display from local blob URL until remote URL resolves

## External Dependencies

| Service | Purpose | Required |
|---------|---------|----------|
| Neon Postgres + Better Auth | DB, auth | Yes (prod) |
| Docker Postgres | Local dev DB | Yes (local) |
| Hocuspocus sync-server | Yjs WebSocket relay | Yes (multiplayer) |
| Vercel (or similar) | Next.js hosting | Yes (prod) |
| Sentry | Error tracking | Recommended |
| PostHog / Plausible | Analytics (privacy-respecting) | Optional |

> `apps/partykit` is legacy (superseded). Root `npm run dev:partykit` aliases to `dev:sync`.

## Security Notes

- Drizzle migrations; app-layer ownership checks (RLS optional later)
- Session cookies via Better Auth; no tokens in localStorage for auth
- Yjs rooms require invite tokens (HTTP seed + websocket admission on sync-server)
- User-uploaded assets size-capped
- Excalidraw loaded client-only (`dynamic` + `ssr: false`)

## Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.2s |
| Time to Interactive (PWA cached) | < 2s |
| Map pan/zoom | 60fps |
| Offline sheet edit latency | < 16ms (local) |
| Sync reconciliation | < 500ms after reconnect |

## Why Not X?

| Alternative | Reason skipped |
|-------------|----------------|
| Electron | Bloated; Tauri deferred to Phase 2 |
| Unity/Godot VTT | Wrong tool; web canvas is sufficient |
| Firebase-only | Vendor lock-in; weaker offline story |
| Pure SPA (no Next) | Lose SSR for marketing/docs; API colocation |
| Redux / Zustand / TanStack Query | Overkill for current Dexie + Yjs shape |
| PartyKit cloud | Durable Object limits on free tier; use self-hosted Hocuspocus |
