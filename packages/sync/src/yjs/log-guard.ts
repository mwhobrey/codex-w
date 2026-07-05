import type { PlaySessionLogEntry } from '@codex/schemas';
import * as Y from 'yjs';
import { PLAY_ROOM_KEYS } from './play-room-doc';

export type LogSnapshot = PlaySessionLogEntry[];

export function captureLogSnapshot(
  doc: Y.Doc,
  arrayKey: string = PLAY_ROOM_KEYS.LOG,
): LogSnapshot {
  return doc.getArray<PlaySessionLogEntry>(arrayKey).toArray();
}

export function restoreLogSnapshot(
  doc: Y.Doc,
  snapshot: LogSnapshot,
  arrayKey: string = PLAY_ROOM_KEYS.LOG,
): void {
  const yLog = doc.getArray<PlaySessionLogEntry>(arrayKey);
  doc.transact(() => {
    yLog.delete(0, yLog.length);
    if (snapshot.length > 0) yLog.push(snapshot);
  });
}

/**
 * True when `before` is no longer a verbatim prefix of `after` — i.e. entries were
 * removed or rewritten rather than only appended. A legitimate GM chapter close is
 * the only op that should ever do this; anything else is either normal appends
 * (not a diff by this definition) or a forged clear.
 */
export function logSnapshotsDiffer(before: LogSnapshot, after: LogSnapshot): boolean {
  if (after.length < before.length) return true;
  for (let i = 0; i < before.length; i++) {
    if (before[i]?.id !== after[i]?.id) return true;
  }
  return false;
}

/** Apply a Yjs update; revert log-array clears when the connection is not GM. */
export function applyUpdateRespectingLog(
  doc: Y.Doc,
  update: Uint8Array,
  allowLogClear: boolean,
  arrayKey: string = PLAY_ROOM_KEYS.LOG,
): void {
  if (allowLogClear) {
    Y.applyUpdate(doc, update);
    return;
  }

  const before = captureLogSnapshot(doc, arrayKey);
  Y.applyUpdate(doc, update);
  const after = captureLogSnapshot(doc, arrayKey);
  if (logSnapshotsDiffer(before, after)) {
    restoreLogSnapshot(doc, before, arrayKey);
  }
}
