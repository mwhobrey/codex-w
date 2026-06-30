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
| `GET` / `HEAD` | `/parties/main/:roomId` | Health probe |
| `POST` | `/parties/main/:roomId?action=seed` | Seed invite token before websocket join |
| `GET` | `/health` | Simple liveness |

WebSocket: standard Hocuspocus on `/` with document name = `roomId`.

## Deploy with Docker (recommended for droplets)

No Node/npm on the host — build and run the container only.

### 1. DNS (Cloudflare)

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| A | `pk` | `<droplet-ip>` | DNS only (grey) |

### 2. Docker network

Your Caddy container must share a network with `codex-sync`. List networks:

```bash
docker network ls
```

Edit `docker-compose.sync-server.yml` if your proxy network is not named `caddy` (common alternatives: `web`, `proxy`, `caddy-net`).

### 3. Start the relay

On the droplet (clone repo or pull latest):

```bash
cd /path/to/codex-w
docker compose -f docker-compose.sync-server.yml up -d --build
```

Verify from the host:

```bash
docker exec codex-sync wget -qO- http://127.0.0.1:1999/health
# → ok
```

### 4. Caddy (Docker)

Point at the **container name** on the shared network (not `127.0.0.1`):

```caddy
pk.whobrey.me {
  reverse_proxy codex-sync:1999
}
```

Reload/restart Caddy. External check:

```bash
curl https://pk.whobrey.me/health
```

### 5. Vercel env + redeploy

```
NEXT_PUBLIC_SYNC_HOST=pk.whobrey.me
NEXT_PUBLIC_SYNC_CONNECT=true
```

### Updating

```bash
git pull
docker compose -f docker-compose.sync-server.yml up -d --build
```

## Deploy without Docker (dev / bare metal)

```bash
npm install
PORT=1999 HOST=0.0.0.0 npm run start --workspace=@codex/sync-server
```

## Security

- Invite token must be HTTP-seeded before websocket admission (prevents room squatting).
- Server-side fog write guard for non-GM peers (same behavior as former PartyKit worker).

## Limitations (MVP)

- Invite tokens are in-memory (lost on container restart; rooms re-seed on first join).
- No Postgres backup of Yjs state (local y-indexeddb + relay only).
