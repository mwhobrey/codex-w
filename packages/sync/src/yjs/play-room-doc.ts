import type { PlaySessionLogEntry } from '@codex/schemas';
import * as Y from 'yjs';

export const PLAY_ROOM_KEYS = {
  EXCALIDRAW: 'excalidraw',
  LOG: 'log',
} as const;

export function createPlayRoomDoc(): Y.Doc {
  return new Y.Doc();
}

export function getPlayRoomLogArray(doc: Y.Doc): Y.Array<PlaySessionLogEntry> {
  return doc.getArray<PlaySessionLogEntry>(PLAY_ROOM_KEYS.LOG);
}

/** Serialized Excalidraw elements — one entry per element JSON. */
export function getPlayRoomExcalidrawElements(doc: Y.Doc): Y.Array<unknown> {
  return doc.getArray(`${PLAY_ROOM_KEYS.EXCALIDRAW}-elements`);
}
