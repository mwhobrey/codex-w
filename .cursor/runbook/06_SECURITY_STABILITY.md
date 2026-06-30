# Security & stability notes

> Last updated: 2025-06-24 — backlog sprint (invite race, shared session, excalidraw)

## Fixed recently

- **Invite resume** — multi-source resolution (URL, Yjs meta, per-room storage, recent tables)
- **PartyKit probe** — `wss://` for non-local hosts (matches y-partykit)
- **Table meta writes** — incremental Y.Map patch instead of clear-and-rewrite
- **Room IDs** — 16 hex chars (was 8) to reduce squatting surface
- **Token drag** — local drag preview, throttled Yjs sync, debounced prune, no-op upserts
- **Atomic invite seeding** — PartyKit forces HTTP POST seeding before WebSocket connection is allowed. Any unseeded WebSocket connections are rejected with 4403, preventing room squatting.
- **Shared play-room session** — refcounted singleton per `roomId` (`play-room-session.ts`); dice hub log push shares doc + invite
- **Excalidraw sync** — incremental element patch (id/version aware) instead of full-array replace; microtask remote-echo guard
- **Invite in URL** — stripped via `replaceState` after hydrate; token lives in storage + Yjs meta only
- **Fog write enforcement** — PartyKit `guardedOnConnect` reverts fog-map mutations from non-GM peers (awareness `ownerId` vs meta `gmUserId`)

## Known limitations (dogfood OK, not production-hardened)

| Area | Risk | Mitigation path |
|------|------|-----------------|
| **Excalidraw under fog** | Map elements under fogged cells still sync to all peers | Per-peer filtered excalidraw sync or server-side scene culling |

## PartyKit checklist

1. `npm run dev:partykit` on port 1999
2. `NEXT_PUBLIC_PARTYKIT_HOST=127.0.0.1:1999` in `apps/web/.env.local`
3. Resume tables via share link once to seed `codex-table-invite-{roomId}` in localStorage

## CI

```bash
npm run test
npm run ci
npm run test:e2e   # requires PartyKit on 1999 + web build with PARTYKIT env
```
