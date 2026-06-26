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
| Client state | **Zustand** (UI) + **TanStack Query** (server) | Minimal boilerplate; cache + background sync |
| Validation | **Zod** | Runtime + compile-time contracts |
| PWA | **Serwist** (Workbox successor) | Offline shell, asset caching, installable |

### Server & Infrastructure

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Primary DB | **PostgreSQL** (Neon prod / Docker local) | Relational truth for users, sheets, sessions, asset refs |
| Auth | **Better Auth** + Drizzle adapter | Self-hosted; httpOnly cookies; no per-MAU tax |
| Object storage | **S3-compatible** (MinIO local, R2/S3 prod) | Map exports, character portraits, custom assets |
| Realtime | **PartyKit** (MVP) → Hocuspocus (optional later) | Managed Yjs WebSocket relay; scales per-room |
| Edge / API | Next.js Route Handlers | Thin server; heavy logic stays client-side |
| Monorepo | **Turborepo** + **npm workspaces** | Shared packages, fast CI caches |

### Deferred / Phase 2

| Layer | Choice | When |
|-------|--------|------|
| Desktop shell | **Tauri 2** | Native install, deeper filesystem, optional |
| Mobile | **Expo** (shared `packages/*`) | Post-MVP if demand exists |
| Full SQL sync | **Electric SQL** or **PowerSync** | If Dexie→Postgres replication becomes painful |

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
                              │ PartyKit     │
                              └──────┬───────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │ PostgreSQL   │
                              │ (snapshots)  │
                              └──────────────┘
```

- **Reads** always hit local first → instant UI
- **Writes** go to local immediately → optimistic UX
- **Sync queue** pushes deltas when connectivity returns
- **CRDT** handles concurrent map/note edits without merge hell

### Plugin Architecture (Game Systems)

Each RPG is a `packages/game-systems/<system>/` plugin implementing:

```typescript
interface GameSystemPlugin {
  id: string;                    // e.g. "loner", "totv"
  name: string;
  characterSheet: SheetDefinition;  // JSON Schema / Zod
  soloEngine?: SoloEngineConfig;    // oracle tables, twist prompts
  dicePresets?: DicePreset[];
  metadata: { tags, publisher, version };
}
```

Core app loads plugins dynamically; solo systems ship first-class.

### Session Model

| Mode | Behavior |
|------|----------|
| **Solo** | Single user, local-only or optional cloud backup |
| **Hosted** | GM owns room; players join via invite link |
| **Peer** | All clients equal; Yjs room, no dedicated GM server |

Permissions enforced server-side (Postgres RLS) + client-side (Yjs awareness).

## Data Flow

### Character Sheet

1. User edits field → Zod validate → Dexie write (instant)
2. Debounced sync job → POST `/api/sheets/:id` → Postgres upsert
3. Other clients → TanStack Query invalidation or Yjs map update

### VTT Map

1. Excalidraw `onChange` → debounced Yjs `excalidraw-elements` array → y-indexeddb persist
2. Online → PartyKit Yjs relay broadcasts to room
3. Periodic snapshot → Postgres `map_snapshots` (JSON blob + version)

### Dice / Oracle Roll

1. Client-side RNG (crypto.getRandomValues) — trust-but-verify optional log
2. Roll event appended to session log (Dexie + optional sync)
3. Solo oracle → `game-engine` resolves table lookup locally

### Asset Upload

1. Client compresses image → S3-compatible storage (when online)
2. Metadata + URL stored in Dexie; queued if offline
3. Display from local blob URL until remote URL resolves

## External Dependencies

| Service | Purpose | Required |
|---------|---------|----------|
| Neon Postgres + Better Auth | DB, auth | Yes (prod) |
| Docker Postgres | Local dev DB | Yes (local) |
| PartyKit | Yjs WebSocket relay (MVP) | Yes (multiplayer) |
| Vercel (or similar) | Next.js hosting | Yes (prod) |
| Sentry | Error tracking | Recommended |
| PostHog / Plausible | Analytics (privacy-respecting) | Optional |

## Security Notes

- Drizzle migrations; app-layer ownership checks (RLS optional later)
- JWT in httpOnly cookies; no tokens in localStorage
- Yjs rooms require server-issued room tokens (not implemented yet)
- User-uploaded assets scanned + size-capped
- CSP headers strict; Excalidraw loaded client-only (`dynamic` + `ssr: false`)

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
| Redux | Overkill for this shape of state |
