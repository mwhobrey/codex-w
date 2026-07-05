# Plan: Chapters, Tags & Glossary for the Play Journal

> Status: implemented 2026-07-04. All five rollout phases (rename, tags, chapters, search/glossary, extras) landed in one pass.

## Goal

Make the play-area journal/log cohesive for solo (and hosted) RPG play:
user-defined per-entry tags, session-as-chapters with reopen support, and
cross-chapter search — plus a few genre-fit extras (auto glossary, last-seen
callback, recap-on-reopen, pin/star).

## What already exists (reuse, don't rebuild)

- `SoloSession` + `JournalEntry` (`packages/schemas`, `packages/db/src/schema/app.ts`,
  `packages/db/src/solo-sessions.ts`, `packages/sync/src/solo-sessions.ts`) — already
  a "chapter" record: owner, system, character, scene focus, game state, timestamps.
- `exportTableToSoloSession` (`packages/sync/src/export-table-session.ts`) — already
  snapshots a live table's Yjs log into a `SoloSession` + `JournalEntry[]`. This is
  the **close chapter** primitive today, wired to a one-off "Export to solo archive"
  button (`table-export-panel.tsx`) with no log-clearing, no permission gate, no tags.
- `importSoloSessionToTable` (`packages/sync/src/yjs/import-solo-session.ts`) — already
  imports a `SoloSession`'s journal back into a live table's Yjs log + `TableMeta`.
  This is the **reopen chapter** primitive today, guarded by `importedSoloSessionId`
  in `gameState` to prevent double-import.
- Cloud sync (`cloud-sync.ts`, `session-sync.ts`) already upserts sessions/journal
  entries to Postgres when signed in, local-first via Dexie otherwise.

So this is ~80% "generalize + wire up existing plumbing into a real lifecycle,"
not new infrastructure. That keeps this lower-risk than it looks at first glance.

## Decisions (resolved)

1. **Rename `SoloSession` / `solo_sessions` → `PlaySession` / `play_sessions`.**
   Doing this now while the surface is small. See "Rename" section below for the
   full list of touched identifiers.
2. **GM gate enforcement — reuse the exact fog pattern, don't invent a new one.**
   See "Permission gating" below — this was the point of evaluating further:
   the app already has a two-tier GM-enforcement structure (client UI gate +
   relay-enforced snapshot/revert guard) used for fog. Chapter close should use
   the identical structure, not a bespoke check.
3. **Tag storage — saved/curated list, global to the owner, reusable across
   tables and game systems.** Modeled as its own small entity, same shape as
   `DiceSet`/`UserLibraryTable` (owner-scoped CRUD, Dexie + Postgres + sync route).
   See "Saved tags" below.

## Permission gating (reuse the existing GM pattern)

Traced the current structure via `table-gm.ts`, `table-meta.ts`, and
`fog-guard.ts` (both the shared logic in `packages/sync/src/yjs/fog-guard.ts`
and its Hocuspocus wiring in `apps/sync-server/src/fog-guard.ts` +
`apps/sync-server/src/index.ts`). The app already has a consistent two-tier
model — every future GM-only action should follow it rather than rolling its
own check:

- **Tier 1 — client UI gate.** `isTableGm(meta, ownerId)` (`apps/web/lib/table-gm.ts`)
  decides what renders/is enabled — used today to gate the fog GM-preview toggle
  and (implicitly) the GM control component. Cheap, not tamper-proof, fine for
  low-stakes actions (this is also how "Pass GM" transfer works — no relay
  enforcement, because a forged transfer isn't a real integrity risk).
- **Tier 2 — relay-enforced guard, only for actions where a forged client
  action would actually break the game for other players.** Fog uses a
  snapshot-before/apply/revert-after pattern because Yjs can't reject a
  specific op mid-flight — `beforeFogGuard`/`afterFogGuard` snapshot the fog map,
  let the update apply, then revert it if `connectionIsTableGm` (identity read
  from Yjs awareness `user.ownerId`, not the untrusted payload) says the
  connection isn't GM. Wired into Hocuspocus's `beforeHandleMessage` /
  `afterHandleMessage` hooks in `apps/sync-server/src/index.ts`.

**Chapter close falls into Tier 2** — a forged "End Session" from a non-GM
player would wipe the log for everyone else at the table, same integrity class
as fog cheating. So: add `packages/sync/src/yjs/log-guard.ts` (shared,
mirroring `fog-guard.ts` exactly — `captureLogSnapshot` / `restoreLogSnapshot` /
`logSnapshotsDiffer` / `applyUpdateRespectingLog` operating on the log `Y.Array`
instead of the fog `Y.Map`) and `apps/sync-server/src/log-guard.ts` (mirroring
`apps/sync-server/src/fog-guard.ts`'s `beforeLogGuard`/`afterLogGuard`), then
add two lines to the existing hooks in `apps/sync-server/src/index.ts`:

```ts
async beforeHandleMessage({ document, connection }) {
  beforeFogGuard(document, connection);
  beforeLogGuard(document, connection);
},
async afterHandleMessage({ document, connection }) {
  afterFogGuard(document, connection);
  afterLogGuard(document, connection);
},
```

Chapter metadata patches (`chapterNumber`, archived-session linkage) stay
Tier 1 only, same as GM transfer — the content-destroying log clear is the only
part that needs Tier 2.

## Saved tags (curated, cross-game)

Same shape as the existing `DiceSet`/`UserLibraryTable` entities — owner-scoped,
synced, reusable everywhere:

- `packages/schemas/src/index.ts` — new `SavedTagSchema`: `id`, `ownerId`,
  `label` (the tag text), `color?`, `createdAt`, `lastUsedAt`.
- `packages/db/src/schema/app.ts` — new `saved_tags` table (mirrors `dice_sets`
  shape); migration in `0002_chapters_tags.sql`.
- `packages/db/src/saved-tags.ts` — CRUD mirroring `packages/db/src/solo-sessions.ts`.
- `packages/sync/src/saved-tags.ts` — Dexie repo mirroring `diceSetRepo`; `db.ts`
  version bump adds `savedTags` table.
- `apps/web/lib/saved-tag-sync.ts` + API route — mirrors `dice-set-sync.ts` /
  `queueDiceSetSync` pattern exactly; add to `cloud-sync.ts`'s merge list
  alongside `mergeDiceSet`.
- Tag autocomplete on the note composer reads the union of saved tags (global)
  + recently-used tags on that table, deduped, saved tags listed first.
- Typing a brand-new tag while composing offers a "Save tag for reuse" inline
  affordance that writes to `saved_tags` — opt-in, not automatic, so the list
  doesn't get cluttered with one-off tags.

## Rename: `SoloSession` → `PlaySession`

Touches every layer, but it's a mechanical rename plus the new fields below —
doing both in the same migration:

- `packages/schemas/src/index.ts` — `SoloSessionSchema`/`SoloSession` → `PlaySessionSchema`/`PlaySession`.
- `packages/db/src/schema/app.ts` — table `solo_sessions` → `play_sessions`.
- `packages/db/src/solo-sessions.ts` → rename file to `play-sessions.ts`, `soloSessionRepo`-style
  functions renamed accordingly (`listPlaySessionsByOwner`, etc.).
- `packages/sync/src/solo-sessions.ts` → rename to `play-sessions.ts`, `soloSessionRepo` → `playSessionRepo`.
- `packages/sync/src/db.ts` — Dexie table `soloSessions` → `playSessions` (version bump handles the rename).
- `packages/sync/src/export-table-session.ts` — return type `{ session: PlaySession, ... }`.
- `packages/sync/src/yjs/import-solo-session.ts` → rename to `import-play-session.ts`.
- `apps/web/app/api/sessions/[id]/...` routes and `session-sync.ts`/`cloud-sync.ts` — variable/type renames only, URL shape (`/api/sessions/:id`) can stay since it's already generic.
- `apps/web/components/play/table-export-panel.tsx` — repurposed into the End Session action (see Chapter lifecycle).

## Data model changes

`packages/schemas/src/index.ts`:
- `JournalEntrySchema` — add `tags: z.array(z.string().min(1).max(32)).max(16).optional()`,
  `pinned: z.boolean().optional()`.
- `PlaySessionLogEntrySchema` — same two fields (tags, pinned) so live-table entries
  and archived-chapter entries share shape.
- `PlaySessionSchema` (renamed, see above) — add:
  - `roomId: z.string().optional()` — links a chapter back to the live table it
    came from, so "list chapters for this table" and "reopen most recent" work.
  - `chapterNumber: z.number().int().min(1).optional()`.
  - `status: z.enum(['open', 'closed']).optional()` — informational only; a table's
    live log is always the "open" chapter, closed ones are snapshots.
- New `SavedTagSchema` (see "Saved tags" above).

`packages/db/src/schema/app.ts` + new migration `packages/db/drizzle/0002_chapters_tags.sql`:
- `solo_sessions` → `play_sessions`: add `room_id text`, `chapter_number integer`, `status text`.
- `journal_entries`: add `tags jsonb`, `pinned boolean default false`.
- new `saved_tags` table.

`packages/sync/src/db.ts`: Dexie `version(6)` bump — rename `soloSessions` → `playSessions`,
add indexes for `roomId`, add new `savedTags` table. `journalEntries` stays as-is
structurally (tags filtered client-side; table is small per session).

## Chapter lifecycle

**End Session** (Tier 1 client gate: `isTableGm(meta, ownerId)` on hosted tables,
always-allowed for the owner on solo tables; Tier 2 relay guard backs up the
actual log clear — see Permission gating):
1. Confirm dialog (button only rendered/enabled per Tier 1 gate).
2. `exportTableToPlaySession(meta, logEntries, ownerId, { chapterNumber, roomId })` —
   renamed from `exportTableToSoloSession`; extend to pass `tags`/`pinned` through
   on each mapped entry (currently dropped) and to upsert (not just insert) so
   reopening + re-closing the same chapter updates its record instead of duplicating it.
3. Persist via existing `playSessionRepo.save` / `journalRepo.append` + queue cloud
   sync (`queueSessionSync` / `queueJournalSync` — no changes needed, schema-driven).
4. **New:** clear the live Yjs log (`packages/sync/src/yjs/chapter-lifecycle.ts`,
   new file — `closeChapter(doc, roomId, meta, ownerId)` wrapping steps 2–4). The
   actual array clear goes through the same code path the relay's `log-guard.ts`
   inspects, so a legitimate GM close survives the guard and a forged one gets
   reverted. Bump `TableMeta.chapterNumber`. Append one `system` log entry to the
   fresh log: "Chapter N closed by {GM}" for continuity before the next entry lands.

**Reopen chapter**: list past chapters for `roomId` (`listByRoom` query, new), pick
one, call `importPlaySessionToTable` (renamed from `importSoloSessionToTable`;
relax the `isSoloSessionImported`/`isPlaySessionImported` guard so a chapter can
be resumed even if it was previously imported/closed) — this restores `TableMeta`
+ replays journal entries into the live log so play continues. Next "End Session"
upserts the same chapter record rather than creating a new one. Reopen is Tier 1
only (same stakes as any other meta patch) — no relay guard needed since it's
additive, not destructive.

## Cross-chapter search

- `packages/db/src/solo-sessions.ts` — add `searchJournalEntries(db, ownerId, { tag?, type?, text?, gameSystemId? })`.
- `packages/sync/src/solo-sessions.ts` — Dexie equivalent for offline search.
- New UI: a "Search journal" view (chip-based tag filter + text search) reachable
  from the play room and from a standalone `/journal` route listing all chapters
  across tables, grouped by system/table.

## Extras (rolled in from earlier discussion)

- **Auto glossary** — new `table-glossary-panel.tsx`, a pure derived view grouping
  entries by tag for a small set of *suggested* (not enforced) conventions —
  `npc`, `location`, `item`, `faction` — showing first/last mention + jump-to-chapter.
  No schema changes beyond tags already being there.
- **Last-seen callback** — when composing a note and typing an existing tag, look
  up the most recent prior entry with that tag across all chapters for the room
  and show "Last mentioned in Chapter 2 · 3 days ago" with a jump link.
- **Recap on reopen** — when reopening a chapter (or returning to a table with a
  closed previous chapter), show its last few `scene`/`twist` entries as a
  "Previously, on…" card.
- **Pin/star** — `pinned` field (above), toggle button per entry, pinned filter
  chip alongside the existing type filters in `session-log-panel.tsx`.

## Rollout phases

0. **Rename** `SoloSession` → `PlaySession` across schema/db/sync (mechanical,
   do first so nothing later builds on the old name).
1. **Tags foundation** — schema + migration + saved-tags entity (schema, db,
   sync repo, API route, cloud-sync merge) + tag input/autocomplete/chips on
   note composer + tag filter in `session-log-panel.tsx` + carry tags through
   export/import.
2. **Chapters** — `log-guard.ts` (shared + sync-server, mirroring `fog-guard.ts`),
   wire into `apps/sync-server/src/index.ts`'s existing hooks, `isTableGm` client
   gate on the End Session button, `closeChapter`/`chapter-lifecycle.ts`, Reopen
   action + chapter list UI.
3. **Cross-chapter search + glossary rollup.**
4. **Extras** — last-seen callback, recap card, pin/star.

## Files touched (concrete)

- `packages/schemas/src/index.ts` (rename + tags/pinned + chapter fields + `SavedTagSchema`)
- `packages/db/src/schema/app.ts`, new `packages/db/drizzle/0002_chapters_tags.sql`
  (`play_sessions` rename, `saved_tags` table, tag/pinned columns)
- `packages/db/src/solo-sessions.ts` → rename `play-sessions.ts` (extend mappers, add search)
- new `packages/db/src/saved-tags.ts`
- `packages/sync/src/db.ts` (Dexie v6 — rename table, add `savedTags`)
- `packages/sync/src/solo-sessions.ts` → rename `play-sessions.ts` (tag/room queries)
- new `packages/sync/src/saved-tags.ts`
- `packages/sync/src/export-table-session.ts` → `exportTableToPlaySession` (tags passthrough, upsert semantics, chapterNumber)
- `packages/sync/src/yjs/import-solo-session.ts` → rename `import-play-session.ts` (relax re-import guard)
- new `packages/sync/src/yjs/chapter-lifecycle.ts` (`closeChapter`, log clear)
- new `packages/sync/src/yjs/log-guard.ts` (mirrors `fog-guard.ts`)
- new `apps/sync-server/src/log-guard.ts` (mirrors `apps/sync-server/src/fog-guard.ts`)
- `apps/sync-server/src/index.ts` (register `beforeLogGuard`/`afterLogGuard` alongside fog guard)
- `apps/web/lib/table-gm.ts` (reuse `isTableGm` for the End Session gate — no new helper)
- `apps/web/components/play/session-log-panel.tsx` (tag input, tag filter, pin toggle)
- `apps/web/components/play/table-export-panel.tsx` → repurpose into End Session action with GM gate
- new `apps/web/components/play/chapter-list-panel.tsx`
- new `apps/web/components/play/table-glossary-panel.tsx`
- new `apps/web/lib/saved-tag-sync.ts` (mirrors `dice-set-sync.ts`)
- `apps/web/lib/cloud-sync.ts` (add `mergeSavedTag`, rename `mergeSession`→`mergePlaySession`)
- new `apps/web/app/journal/page.tsx` (cross-chapter search)
- `apps/web/app/api/sessions/[id]/journal/route.ts` (tags flow through automatically once schema updated)
- new `apps/web/app/api/saved-tags/route.ts` (mirrors dice-sets API route)
