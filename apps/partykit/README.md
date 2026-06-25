# @codex/partykit — Yjs relay for Play Together rooms

PartyKit WebSocket server that relays Yjs CRDT updates for multiplayer VTT maps and shared session logs.

## Development

From the repo root:

```bash
npm run dev --workspace=@codex/partykit
```

Default host: `127.0.0.1:1999`

## Environment variables (web client)

Set in `apps/web/.env.local`:

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_PARTYKIT_HOST` | `127.0.0.1:1999` | PartyKit host (`host:port` or deployed `*.partykit.dev`) |
| `NEXT_PUBLIC_PARTYKIT_PARTY` | `main` | Party namespace (matches `partykit.json` main export) |
| `NEXT_PUBLIC_PARTYKIT_CONNECT` | `true` | Set to `false` to force offline-only (skip websocket) |

## Production deploy

```bash
npm run deploy --workspace=@codex/partykit
```

After deploy, set `NEXT_PUBLIC_PARTYKIT_HOST` to your PartyKit project host (e.g. `codex-play.username.partykit.dev`).

## Architecture

- One PartyKit **room** per play URL (`/play/[roomId]`)
- `y-partykit` `onConnect` handles Yjs sync + snapshot persistence in PartyKit storage
- Client uses `y-indexeddb` for offline-first local persistence (see `@codex/sync`)

## Limitations (MVP)

- No room auth or tokens — anyone with the link can join
- Server-side snapshot only; no Postgres backup yet
- Asset uploads (map images) use Excalidraw defaults — no S3 storage hookup yet
