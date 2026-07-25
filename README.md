# Codex

A local-first, sync-capable TTRPG toolkit — dice, oracles, character sheets, interactive VTT maps, solo RPG engines, and single/multiplayer sessions.

## North Star

One beautiful workspace where any TTRPG—especially solo systems like Loner, TOTV, Snallygaster, and Ironsworn—can be played alone or together, online or offline.

## Stack (Summary)

| Layer | Tech |
|-------|------|
| App | Next.js 16, React 19, TypeScript |
| UI | Tailwind v4, shadcn/ui |
| VTT | Excalidraw (MIT) + Yjs |
| Offline | Dexie (IndexedDB), PWA (Serwist) |
| Sync | Yjs + Hocuspocus (`apps/sync-server`) |
| Backend | Neon Postgres + Better Auth (local: Docker Postgres) via `@codex/db` |
| Monorepo | Turborepo + npm workspaces |

Full architecture: [`.cursor/runbook/01_ARCHITECTURE.md`](.cursor/runbook/01_ARCHITECTURE.md)

## Project Structure

```
apps/web           → Next.js application
apps/sync-server   → Hocuspocus Yjs WebSocket server
apps/partykit      → Legacy relay (superseded; reference only)
packages/ui        → Design system primitives
packages/game-engine → Dice, oracles, RNG
packages/game-systems → Per-RPG plugins
packages/sync      → Dexie + Yjs play-room
packages/db        → Drizzle / Postgres
packages/schemas   → Shared Zod types
packages/config    → Shared tooling configs
```

## Getting Started

See **[Local development](.cursor/runbook/05_LOCAL_DEV.md)** for the full stack (Docker Postgres + sync-server + auth).

```bash
npm install
npm run stack:up
cp apps/web/.env.example apps/web/.env.local

# Terminal 1
npm run dev:web

# Terminal 2 (multiplayer /play) — Hocuspocus relay
npm run dev:sync
# (npm run dev:partykit is an alias → sync-server; PartyKit app is legacy)
```

Open [http://localhost:3000](http://localhost:3000). Sign up at `/login` once `.env.local` is set.

> **Status:** See [`.cursor/runbook/04_CURRENT_STATE.md`](.cursor/runbook/04_CURRENT_STATE.md) for roadmap.

## For AI Agents

Consult `.cursor/runbook/00_INDEX.md` before executing tasks. Update the runbook before commits when architecture or status changes.
