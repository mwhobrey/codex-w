# Security & stability notes

> Last updated: 2025-06-30 — self-hosted Hocuspocus relay

## Fixed recently

- **Invite resume** — multi-source resolution (URL, Yjs meta, per-room storage, recent tables)
- **Relay probe** — `wss://` for non-local hosts
- **Atomic invite seeding** — HTTP POST seed before websocket; unseeded joins rejected by `apps/sync-server`
- **Fog write enforcement** — relay `beforeHandleMessage` / `afterHandleMessage` reverts fog-map mutations from non-GM peers

## Known limitations (dogfood OK, not production-hardened)

| Area | Risk | Mitigation path |
|------|------|-----------------|
| **Excalidraw under fog** | Map elements under fogged cells still sync to all peers | Per-peer filtered excalidraw sync or server-side scene culling |

## Sync relay checklist

1. `npm run dev:sync` on port 1999
2. `NEXT_PUBLIC_SYNC_HOST=127.0.0.1:1999` in `apps/web/.env.local`
3. Resume tables via share link once to seed `codex-table-invite-{roomId}` in localStorage

## CI

```bash
npm run test
npm run ci
npm run test:e2e   # starts sync-server on 1999
```
