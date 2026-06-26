# Security & stability notes

> Last updated: 2025-06-24 — quick audit pass after invite + token fixes

## Fixed recently

- **Invite resume** — multi-source resolution (URL, Yjs meta, per-room storage, recent tables)
- **PartyKit probe** — `wss://` for non-local hosts (matches y-partykit)
- **Table meta writes** — incremental Y.Map patch instead of clear-and-rewrite
- **Room IDs** — 16 hex chars (was 8) to reduce squatting surface
- **Token drag** — local drag preview, throttled Yjs sync, debounced prune, no-op upserts

## Known limitations (dogfood OK, not production-hardened)

| Area | Risk | Mitigation path |
|------|------|-----------------|
| **Invite seeding** | First websocket with valid token seeds room storage | Longer room IDs; atomic compare-and-set in PartyKit |
| **Fog / GM** | Enforced in UI only; Yjs doc is readable by all admitted peers | Server-side role filtering or split documents |
| **Excalidraw sync** | Full-array replace every 80ms — last-writer-wins | Per-element Y.Map or y-excalidraw binding |
| **Dice hub log push** | Separate Y.Doc may conflict with open play room | Share play-room provider singleton |
| **Invite in URL** | `replaceState` puts token in browser history | Storage-only after first connect |

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
