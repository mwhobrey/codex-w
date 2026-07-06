import type { PlaySessionLogEntry } from '@codex/schemas';
import * as Y from 'yjs';

export const PLAY_ROOM_KEYS = {
  EXCALIDRAW: 'excalidraw',
  FOG: 'fog',
  LOG: 'log',
  META: 'meta',
  PLAYER_TOKENS: 'playerTokens',
} as const;

/** Mirrors Excalidraw's `BinaryFileData` shape without depending on the excalidraw package. */
export interface PlayRoomFileRecord {
  id: string;
  mimeType: string;
  dataURL: string;
  created: number;
}

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

/** Binary image/file data referenced by Excalidraw elements, keyed by fileId. */
export function getPlayRoomExcalidrawFiles(doc: Y.Doc): Y.Map<PlayRoomFileRecord> {
  return doc.getMap(`${PLAY_ROOM_KEYS.EXCALIDRAW}-files`);
}

/** Grid cell keys `"gx,gy"` → hidden (fogged) when true. */
export function getPlayRoomFogMap(doc: Y.Doc): Y.Map<boolean> {
  return doc.getMap(`${PLAY_ROOM_KEYS.FOG}-hidden`);
}

/** Character-linked player tokens on the map (keyed by characterId). */
export function getPlayRoomPlayerTokensMap(doc: Y.Doc): Y.Map<unknown> {
  return doc.getMap(PLAY_ROOM_KEYS.PLAYER_TOKENS);
}

/** Table/campaign metadata (game system, character, scene focus, etc.). */
export function getPlayRoomMetaMap(doc: Y.Doc): Y.Map<unknown> {
  return doc.getMap(PLAY_ROOM_KEYS.META);
}
