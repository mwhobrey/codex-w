import { describe, expect, it } from 'vitest';
import * as Y from 'yjs';
import { appendPlayRoomLogEntry } from './yjs/play-room-log';
import { createPlayRoomDoc, getPlayRoomLogArray } from './yjs/play-room-doc';
import {
  applyUpdateRespectingLog,
  captureLogSnapshot,
  logSnapshotsDiffer,
  restoreLogSnapshot,
} from './yjs/log-guard';

/** Fork a doc synced to `source`'s current state, so subsequent edits produce a real delta. */
function forkSynced(source: Y.Doc): Y.Doc {
  const fork = new Y.Doc();
  Y.applyUpdate(fork, Y.encodeStateAsUpdate(source));
  return fork;
}

describe('log guard', () => {
  it('treats appends as no diff, and shrinkage as a diff', () => {
    const before = [{ id: 'a' }, { id: 'b' }] as never[];
    expect(logSnapshotsDiffer(before, [...before, { id: 'c' } as never])).toBe(false);
    expect(logSnapshotsDiffer(before, [{ id: 'a' }] as never[])).toBe(true);
    expect(logSnapshotsDiffer(before, [{ id: 'a' }, { id: 'x' }] as never[])).toBe(true);
  });

  it('allows a legitimate log clear (GM chapter close)', () => {
    const server = createPlayRoomDoc();
    appendPlayRoomLogEntry(server, { roomId: 'room-1', type: 'scene', content: 'Opening scene' });

    const gmDoc = forkSynced(server);
    const gmLog = getPlayRoomLogArray(gmDoc);
    gmLog.delete(0, gmLog.length);
    const clearUpdate = Y.encodeStateAsUpdate(gmDoc, Y.encodeStateVector(server));

    applyUpdateRespectingLog(server, clearUpdate, true);
    expect(captureLogSnapshot(server)).toHaveLength(0);
  });

  it('reverts a forged log clear from a non-GM connection', () => {
    const server = createPlayRoomDoc();
    appendPlayRoomLogEntry(server, { roomId: 'room-1', type: 'scene', content: 'Opening scene' });
    const before = captureLogSnapshot(server);

    const cheater = forkSynced(server);
    const cheaterLog = getPlayRoomLogArray(cheater);
    cheaterLog.delete(0, cheaterLog.length);
    const clearUpdate = Y.encodeStateAsUpdate(cheater, Y.encodeStateVector(server));

    applyUpdateRespectingLog(server, clearUpdate, false);
    expect(captureLogSnapshot(server)).toEqual(before);
  });

  it('allows normal appends through even when not GM', () => {
    const server = createPlayRoomDoc();
    appendPlayRoomLogEntry(server, { roomId: 'room-1', type: 'scene', content: 'Opening scene' });

    const writer = forkSynced(server);
    getPlayRoomLogArray(writer).push([
      {
        id: 'new-entry',
        roomId: 'room-1',
        type: 'note',
        content: 'A player note',
        createdAt: new Date().toISOString(),
      },
    ]);
    const appendUpdate = Y.encodeStateAsUpdate(writer, Y.encodeStateVector(server));

    applyUpdateRespectingLog(server, appendUpdate, false);
    expect(captureLogSnapshot(server)).toHaveLength(2);
  });

  it('restores a prior log snapshot explicitly', () => {
    const server = createPlayRoomDoc();
    appendPlayRoomLogEntry(server, { roomId: 'room-1', type: 'scene', content: 'Opening scene' });
    const before = captureLogSnapshot(server);

    const logArray = getPlayRoomLogArray(server);
    logArray.delete(0, logArray.length);
    expect(captureLogSnapshot(server)).toEqual([]);

    restoreLogSnapshot(server, before);
    expect(captureLogSnapshot(server)).toEqual(before);
  });
});
