import { PlaySessionLogEntrySchema, type PlaySessionLogEntry } from '@codex/schemas';
import type * as Y from 'yjs';
import { getPlayRoomLogArray } from './play-room-doc';

export function appendPlayRoomLogEntry(
  doc: Y.Doc,
  entry: Omit<PlaySessionLogEntry, 'id' | 'createdAt'> & { id?: string; createdAt?: string },
): PlaySessionLogEntry {
  const parsed = PlaySessionLogEntrySchema.parse({
    ...entry,
    id: entry.id ?? crypto.randomUUID(),
    createdAt: entry.createdAt ?? new Date().toISOString(),
  });

  doc.transact(() => {
    getPlayRoomLogArray(doc).push([parsed]);
  });

  return parsed;
}

export function readPlayRoomLogEntries(doc: Y.Doc): PlaySessionLogEntry[] {
  return getPlayRoomLogArray(doc).toArray();
}

/** Patch a single log entry in place (e.g. toggling `pinned`) by id. */
export function patchPlayRoomLogEntry(
  doc: Y.Doc,
  id: string,
  patch: Partial<Pick<PlaySessionLogEntry, 'tags' | 'pinned'>>,
): void {
  const logArray = getPlayRoomLogArray(doc);
  const index = logArray.toArray().findIndex((entry) => entry.id === id);
  if (index === -1) return;

  const current = logArray.get(index);
  const next = PlaySessionLogEntrySchema.parse({ ...current, ...patch });
  doc.transact(() => {
    logArray.delete(index, 1);
    logArray.insert(index, [next]);
  });
}
