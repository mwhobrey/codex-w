# Codex

A local-first, sync-capable TTRPG toolkit — dice, oracles, character sheets, interactive VTT maps, solo RPG engines, and single/multiplayer sessions.

## North Star

One beautiful workspace where any TTRPG—especially solo systems like Loner, TOTV, Snallygaster, and Ironforge—can be played alone or together, online or offline.

## Stack (Summary)

| Layer | Tech |
|-------|------|
| App | Next.js 15, React 19, TypeScript |
| UI | Tailwind v4, shadcn/ui, Framer Motion |
| VTT | tldraw + Yjs |
| Offline | Dexie (IndexedDB), PWA (Serwist) |
| Sync | Yjs, Hocuspocus/PartyKit |
| Backend | Neon Postgres + Better Auth (local: Docker Postgres) |
| Monorepo | Turborepo + pnpm |

Full architecture: [`.cursor/runbook/01_ARCHITECTURE.md`](.cursor/runbook/01_ARCHITECTURE.md)

## Project Structure

```
apps/web           → Next.js application
apps/sync-server   → Yjs WebSocket server
packages/ui        → Design system
packages/game-engine → Dice, oracles, RNG
packages/game-systems → Per-RPG plugins
packages/sync      → Offline + CRDT sync
packages/schemas   → Shared Zod types
packages/config    → Shared tooling configs
```

## Getting Started

See **[Local development](.cursor/runbook/05_LOCAL_DEV.md)** for the full stack (Docker Postgres + PartyKit + Arc B auth).

```bash
npm install
npm run stack:up
cp apps/web/.env.example apps/web/.env.local

# Terminal 1
npm run dev:web

# Terminal 2 (multiplayer /play)
npm run dev:partykit
```

Open [http://localhost:3000](http://localhost:3000). Sign up at `/login` once `.env.local` is set.

> **Status:** See [`.cursor/runbook/04_CURRENT_STATE.md`](.cursor/runbook/04_CURRENT_STATE.md) for roadmap.

## For AI Agents

Consult `.cursor/runbook/00_INDEX.md` before executing tasks. Update the runbook before commits when architecture or status changes.
