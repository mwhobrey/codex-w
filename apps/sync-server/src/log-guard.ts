import {
  captureLogSnapshot,
  logSnapshotsDiffer,
  restoreLogSnapshot,
  type LogSnapshot,
} from '@codex/sync/yjs/log-guard';
import type { Connection, Document } from '@hocuspocus/server';
import { connectionIsTableGm } from './fog-guard.js';

const pendingLogSnapshot = new WeakMap<Connection, LogSnapshot>();

export function beforeLogGuard(doc: Document, conn: Connection): void {
  if (!connectionIsTableGm(doc, conn)) {
    pendingLogSnapshot.set(conn, captureLogSnapshot(doc));
  }
}

export function afterLogGuard(doc: Document, conn: Connection): void {
  const before = pendingLogSnapshot.get(conn);
  pendingLogSnapshot.delete(conn);
  if (!before || connectionIsTableGm(doc, conn)) return;

  const after = captureLogSnapshot(doc);
  if (logSnapshotsDiffer(before, after)) {
    restoreLogSnapshot(doc, before);
  }
}
