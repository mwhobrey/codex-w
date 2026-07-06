import type * as Y from 'yjs';

export const PLAY_ROOM_KICK_MAP_KEY = 'kick-requests';

export type KickSnapshot = Map<string, number>;

/** GM client: request that a peer's live connection be force-closed by the relay. */
export function requestKick(doc: Y.Doc, targetOwnerId: string): void {
  doc.getMap<number>(PLAY_ROOM_KICK_MAP_KEY).set(targetOwnerId, Date.now());
}

export function captureKickSnapshot(doc: Y.Doc, mapKey = PLAY_ROOM_KICK_MAP_KEY): KickSnapshot {
  const snapshot: KickSnapshot = new Map();
  doc.getMap<number>(mapKey).forEach((value, key) => {
    snapshot.set(key, value);
  });
  return snapshot;
}

export function restoreKickSnapshot(
  doc: Y.Doc,
  snapshot: KickSnapshot,
  mapKey = PLAY_ROOM_KICK_MAP_KEY,
): void {
  const yMap = doc.getMap<number>(mapKey);
  doc.transact(() => {
    yMap.forEach((_, key) => {
      if (!snapshot.has(key)) yMap.delete(key);
    });
    snapshot.forEach((value, key) => {
      if (yMap.get(key) !== value) yMap.set(key, value);
    });
  });
}

export function kickSnapshotsDiffer(before: KickSnapshot, after: KickSnapshot): boolean {
  if (before.size !== after.size) return true;
  for (const [key, value] of before) {
    if (after.get(key) !== value) return true;
  }
  for (const key of after.keys()) {
    if (!before.has(key)) return true;
  }
  return false;
}
