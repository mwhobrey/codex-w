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
