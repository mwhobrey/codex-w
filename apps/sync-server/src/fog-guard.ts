import {
  captureFogSnapshot,
  fogSnapshotsDiffer,
  readTableGmUserId,
  restoreFogSnapshot,
  type FogSnapshot,
} from '@codex/sync/yjs/fog-guard';
import type { Connection, Document } from '@hocuspocus/server';

const pendingFogSnapshot = new WeakMap<Connection, FogSnapshot>();

export function connectionIsTableGm(doc: Document, conn: Connection): boolean {
  const gmUserId = readTableGmUserId(doc);
  if (!gmUserId) return false;

  const entry = doc.connections.get(conn);
  if (!entry) return false;

  for (const clientId of entry.clients) {
    const user = doc.awareness.getStates().get(clientId)?.user as
      | { ownerId?: string }
      | undefined;
    if (user?.ownerId === gmUserId) return true;
  }

  return false;
}

export function beforeFogGuard(doc: Document, conn: Connection): void {
  if (!connectionIsTableGm(doc, conn)) {
    pendingFogSnapshot.set(conn, captureFogSnapshot(doc));
  }
}

export function afterFogGuard(doc: Document, conn: Connection): void {
  const before = pendingFogSnapshot.get(conn);
  pendingFogSnapshot.delete(conn);
  if (!before || connectionIsTableGm(doc, conn)) return;

  const after = captureFogSnapshot(doc);
  if (fogSnapshotsDiffer(before, after)) {
    restoreFogSnapshot(doc, before);
  }
}
