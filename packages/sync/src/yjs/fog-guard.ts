import type { Awareness } from 'y-protocols/awareness';
import * as Y from 'yjs';

export const PLAY_ROOM_FOG_MAP_KEY = 'fog-hidden';
export const PLAY_ROOM_META_MAP_KEY = 'meta';

export type FogSnapshot = Map<string, boolean>;

export function captureFogSnapshot(doc: Y.Doc, mapKey = PLAY_ROOM_FOG_MAP_KEY): FogSnapshot {
  const snapshot: FogSnapshot = new Map();
  doc.getMap(mapKey).forEach((value, key) => {
    snapshot.set(key, Boolean(value));
  });
  return snapshot;
}

export function restoreFogSnapshot(
  doc: Y.Doc,
  snapshot: FogSnapshot,
  mapKey = PLAY_ROOM_FOG_MAP_KEY,
): void {
  const yFog = doc.getMap(mapKey);
  doc.transact(() => {
    yFog.forEach((_, key) => {
      if (!snapshot.has(key)) yFog.delete(key);
    });
    snapshot.forEach((value, key) => {
      if (yFog.get(key) !== value) yFog.set(key, value);
    });
  });
}

export function fogSnapshotsDiffer(before: FogSnapshot, after: FogSnapshot): boolean {
  if (before.size !== after.size) return true;
  for (const [key, value] of before) {
    if (after.get(key) !== value) return false;
  }
  for (const key of after.keys()) {
    if (!before.has(key)) return true;
  }
  return false;
}

/** Apply a Yjs update; revert fog-map mutations when the connection is not GM. */
export function applyUpdateRespectingFog(
  doc: Y.Doc,
  update: Uint8Array,
  allowFogWrites: boolean,
  mapKey = PLAY_ROOM_FOG_MAP_KEY,
): void {
  if (allowFogWrites) {
    Y.applyUpdate(doc, update);
    return;
  }

  const before = captureFogSnapshot(doc, mapKey);
  Y.applyUpdate(doc, update);
  const after = captureFogSnapshot(doc, mapKey);
  if (fogSnapshotsDiffer(before, after)) {
    restoreFogSnapshot(doc, before, mapKey);
  }
}

export function readTableGmUserId(doc: Y.Doc, mapKey = PLAY_ROOM_META_MAP_KEY): string | undefined {
  const gm = doc.getMap(mapKey).get('gmUserId');
  return typeof gm === 'string' && gm.trim() ? gm.trim() : undefined;
}

export interface AwarenessConnectionDoc {
  awareness: Awareness;
  conns: Map<unknown, Set<number>>;
}

/** True when a websocket connection controls awareness owned by the table GM. */
export function connectionIsTableGm(
  doc: Y.Doc & AwarenessConnectionDoc,
  conn: unknown,
): boolean {
  const gmUserId = readTableGmUserId(doc);
  if (!gmUserId) return false;

  const controlled = doc.conns.get(conn);
  if (!controlled) return false;

  for (const clientId of controlled) {
    const user = doc.awareness.getStates().get(clientId)?.user as
      | { ownerId?: string }
      | undefined;
    if (user?.ownerId === gmUserId) return true;
  }

  return false;
}
