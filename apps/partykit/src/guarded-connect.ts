import type * as Party from 'partykit/server';
import { onConnect, unstable_getYDoc, type YPartyKitOptions } from 'y-partykit';
import {
  captureFogSnapshot,
  connectionIsTableGm,
  fogSnapshotsDiffer,
  restoreFogSnapshot,
  type FogSnapshot,
} from '@codex/sync/yjs/fog-guard';

type GuardedDoc = Awaited<ReturnType<typeof unstable_getYDoc>>;

const fogGuardInstalled = new WeakSet<GuardedDoc>();
const pendingFogSnapshot = new WeakMap<GuardedDoc, FogSnapshot>();

function installFogWriteGuard(doc: GuardedDoc): void {
  if (fogGuardInstalled.has(doc)) return;
  fogGuardInstalled.add(doc);

  doc.on('beforeTransaction', (transaction) => {
    try {
      const origin = transaction.origin;
      if (origin && doc.conns?.has(origin) && !connectionIsTableGm(doc, origin)) {
        pendingFogSnapshot.set(doc, captureFogSnapshot(doc));
      }
    } catch (err) {
      console.error('Error in beforeTransaction fog guard:', err);
    }
  });

  doc.on('afterTransaction', (transaction) => {
    try {
      const origin = transaction.origin;
      const before = pendingFogSnapshot.get(doc);
      pendingFogSnapshot.delete(doc);
      if (!before || !origin || !doc.conns?.has(origin)) return;
      if (connectionIsTableGm(doc, origin)) return;

      const after = captureFogSnapshot(doc);
      if (fogSnapshotsDiffer(before, after)) {
        restoreFogSnapshot(doc, before);
      }
    } catch (err) {
      console.error('Error in afterTransaction fog guard:', err);
    }
  });
}

/** y-partykit onConnect plus server-side fog write enforcement for non-GM peers. */
export async function guardedOnConnect(
  conn: Party.Connection,
  room: Party.Room,
  options: YPartyKitOptions = {},
): Promise<void> {
  await onConnect(conn, room, options);
  const doc = await unstable_getYDoc(room, options);
  installFogWriteGuard(doc);
}
