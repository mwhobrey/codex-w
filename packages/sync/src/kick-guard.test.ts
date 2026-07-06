import { describe, expect, it } from 'vitest';
import * as Y from 'yjs';
import { createPlayRoomDoc } from './yjs/play-room-doc';
import { writeTableMeta } from './yjs/table-meta';
import {
  captureKickSnapshot,
  kickSnapshotsDiffer,
  requestKick,
  restoreKickSnapshot,
} from './yjs/kick-guard';

describe('kick guard', () => {
  it('detects kick-request snapshot changes', () => {
    const before = new Map([['owner-1', 1000]]);
    const after = new Map([['owner-1', 1000], ['owner-2', 2000]]);
    expect(kickSnapshotsDiffer(before, after)).toBe(true);
    expect(kickSnapshotsDiffer(before, new Map([['owner-1', 1000]]))).toBe(false);
    expect(kickSnapshotsDiffer(before, new Map([['owner-1', 999]]))).toBe(true);
  });

  it('requestKick writes a pending entry for the target owner', () => {
    const doc = createPlayRoomDoc();
    requestKick(doc, 'owner-1');
    const snapshot = captureKickSnapshot(doc);
    expect(snapshot.has('owner-1')).toBe(true);
  });

  it('restoreKickSnapshot reverts a forged kick request', () => {
    const doc = createPlayRoomDoc();
    writeTableMeta(doc, { gameSystemId: 'loner', gmUserId: 'gm-1' });
    const before = captureKickSnapshot(doc);

    // A non-GM connection tries to sneak in a kick request for the GM.
    requestKick(doc, 'gm-1');
    expect(captureKickSnapshot(doc).has('gm-1')).toBe(true);

    restoreKickSnapshot(doc, before);
    expect(captureKickSnapshot(doc).has('gm-1')).toBe(false);
  });

  it('is a no-op revert when nothing changed', () => {
    const doc = createPlayRoomDoc();
    const before = captureKickSnapshot(doc);
    restoreKickSnapshot(doc, before);
    expect(captureKickSnapshot(doc).size).toBe(0);
  });
});
