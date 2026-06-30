# @codex/sync-server

Self-hosted Yjs relay for multiplayer play rooms (Hocuspocus). Replaces managed PartyKit for dogfood/production on your own VPS.

## Development

From the repo root:

```bash
npm run dev:sync
```

Default: `ws://127.0.0.1:1999`

## Web client env (`apps/web/.env.local`)

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_SYNC_HOST` | falls back to `NEXT_PUBLIC_PARTYKIT_HOST` | Relay host (`host:port` or `pk.example.com`) |
| `NEXT_PUBLIC_SYNC_CONNECT` | falls back to `NEXT_PUBLIC_PARTYKIT_CONNECT` | `false` = offline-only |

Legacy `NEXT_PUBLIC_PARTYKIT_*` names still work.

## HTTP API (PartyKit-compatible paths)

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/parties/main/:roomId` | Health probe |
| `POST` | `/parties/main/:roomId?action=seed` | Seed invite token before websocket join |
| `GET` | `/health` | Simple liveness |

WebSocket: standard Hocuspocus on `/` with document name = `roomId`.

## Deploy on a DigitalOcean droplet

### 1. DNS (Cloudflare — free, no Workers)

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| A | `pk` | `<droplet-ip>` | DNS only (grey) |

`codex-w.whobrey.me` stays on Vercel. Only `pk.whobrey.me` points at the droplet.

### 2. Run the server

```bash
# on droplet
git clone ... && cd codex-w
npm install
PORT=1999 HOST=127.0.0.1 npm run start --workspace=@codex/sync-server
```

Use systemd or Docker in production (see below).

### 3. Caddy TLS (on droplet)

```caddy
pk.whobrey.me {
  reverse_proxy 127.0.0.1:1999
}
```

Reload Caddy. Verify:

```bash
curl -sI "https://pk.whobrey.me/health"
curl -sI "https://pk.whobrey.me/parties/main/test-room"
```

### 4. Vercel env + redeploy

```
NEXT_PUBLIC_SYNC_HOST=pk.whobrey.me
NEXT_PUBLIC_SYNC_CONNECT=true
```

## systemd unit (example)

```ini
[Unit]
Description=Codex Yjs sync relay
After=network.target

[Service]
Type=simple
User=codex
WorkingDirectory=/opt/codex-w
Environment=PORT=1999
Environment=HOST=127.0.0.1
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm run start --workspace=@codex/sync-server
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

## Security

- Invite token must be HTTP-seeded before websocket admission (prevents room squatting).
- Server-side fog write guard for non-GM peers (same behavior as former PartyKit worker).

## Limitations (MVP)

- Invite tokens are in-memory (lost on restart; rooms must re-seed via first joiner).
- No Postgres backup of Yjs state (local y-indexeddb + relay only).
