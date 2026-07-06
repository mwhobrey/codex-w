import {
  captureKickSnapshot,
  kickSnapshotsDiffer,
  restoreKickSnapshot,
  PLAY_ROOM_KICK_MAP_KEY,
  type KickSnapshot,
} from '@codex/sync/yjs/kick-guard';
import type { Connection, Document } from '@hocuspocus/server';
import { connectionIsTableGm } from './fog-guard.js';

/** Same 4403 code the client already treats as "stop retrying," with a reason it can distinguish from a plain rejected invite. */
const KICKED_CLOSE_EVENT = { code: 4403, reason: 'kicked' };

const pendingKickSnapshot = new WeakMap<Connection, KickSnapshot>();

export function beforeKickGuard(doc: Document, conn: Connection): void {
  if (!connectionIsTableGm(doc, conn)) {
    pendingKickSnapshot.set(conn, captureKickSnapshot(doc));
  }
}

/**
 * Force-close the live connection(s) belonging to `targetOwnerId`, if any are
 * on this doc. `Connection.close()` alone only sends a Hocuspocus protocol
 * message over the still-open socket — it does not close the underlying
 * WebSocket, so the client's onClose(code 4403) handling never fires. Close
 * the raw socket directly to produce a real CloseEvent the client can react to.
 */
function disconnectOwner(doc: Document, targetOwnerId: string, requester: Connection): void {
  for (const [otherConn, entry] of doc.connections) {
    if (otherConn === requester) continue;
    for (const clientId of entry.clients) {
      const user = doc.awareness.getStates().get(clientId)?.user as { ownerId?: string } | undefined;
      if (user?.ownerId === targetOwnerId) {
        otherConn.close(KICKED_CLOSE_EVENT);
        otherConn.webSocket.close(KICKED_CLOSE_EVENT.code, KICKED_CLOSE_EVENT.reason);
      }
    }
  }
}

export function afterKickGuard(doc: Document, conn: Connection): void {
  const before = pendingKickSnapshot.get(conn);
  pendingKickSnapshot.delete(conn);

  if (before) {
    // Non-GM connection — revert any kick-request map changes it tried to make.
    if (!connectionIsTableGm(doc, conn)) {
      const after = captureKickSnapshot(doc);
      if (kickSnapshotsDiffer(before, after)) {
        restoreKickSnapshot(doc, before);
      }
    }
    return;
  }

  // GM connection — act on any pending kick requests it just wrote, then clear them.
  const kickMap = doc.getMap<number>(PLAY_ROOM_KICK_MAP_KEY);
  const targets = [...kickMap.keys()];
  if (targets.length === 0) return;

  for (const targetOwnerId of targets) {
    disconnectOwner(doc, targetOwnerId, conn);
  }
  doc.transact(() => {
    kickMap.clear();
  });
}
