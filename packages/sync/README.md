# @codex/sync

Local-first sync layer — Dexie entity repos, Yjs play-room primitives, and a durable cloud mutation queue.

**Key modules:** `db.ts` + entity repos, `yjs/` (doc, providers, fog, tokens, meta, guards), `room-invite.ts`, `cloud-mutation-queue.ts`

Cloud entity backup (sheets, dice sets, etc.) is orchestrated from `apps/web/lib/*-sync.ts`: best-effort HTTP push, then `enqueueCloudMutation` on failure. `CloudSyncProvider` pulls via `GET /api/sync` on sign-in, then flushes the queue (also on `online` + periodic timer).
