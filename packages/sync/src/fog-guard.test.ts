import { describe, expect, it } from 'vitest';
import * as Y from 'yjs';
import { paintFogBrush } from './yjs/fog';
import { createPlayRoomDoc } from './yjs/play-room-doc';
import {
  applyUpdateRespectingFog,
  captureFogSnapshot,
  fogSnapshotsDiffer,
  PLAY_ROOM_META_MAP_KEY,
  restoreFogSnapshot,
} from './yjs/fog-guard';

describe('fog guard', () => {
  it('detects fog snapshot changes', () => {
    const before = new Map([['0,0', true]]);
    const after = new Map([['0,0', true], ['1,0', true]]);
    expect(fogSnapshotsDiffer(before, after)).toBe(true);
    expect(fogSnapshotsDiffer(before, new Map([['0,0', true]]))).toBe(false);
  });

  it('allows fog writes when permitted', () => {
    const doc = createPlayRoomDoc();
    paintFogBrush(doc, 0, 0, 'hide');
    const fogUpdate = Y.encodeStateAsUpdate(doc);

    const server = createPlayRoomDoc();
    applyUpdateRespectingFog(server, fogUpdate, true);
    expect(captureFogSnapshot(server).has('0,0')).toBe(true);
  });

  it('reverts fog writes from non-GM connections', () => {
    const doc = createPlayRoomDoc();
    paintFogBrush(doc, 0, 0, 'hide');
    const fogUpdate = Y.encodeStateAsUpdate(doc);

    const server = createPlayRoomDoc();
    applyUpdateRespectingFog(server, fogUpdate, false);
    expect(captureFogSnapshot(server).size).toBe(0);
  });

  it('allows non-fog updates while blocking fog mutations', () => {
    const writer = new Y.Doc();
    writer.getMap(PLAY_ROOM_META_MAP_KEY).set('name', 'Camp');
    const metaUpdate = Y.encodeStateAsUpdate(writer);

    const server = createPlayRoomDoc();
    applyUpdateRespectingFog(server, metaUpdate, false);
    expect(server.getMap(PLAY_ROOM_META_MAP_KEY).get('name')).toBe('Camp');
    expect(captureFogSnapshot(server).size).toBe(0);
  });

  it('restores prior fog after blocked reveal', () => {
    const server = createPlayRoomDoc();
    paintFogBrush(server, 2, 2, 'hide');
    const before = captureFogSnapshot(server);

    const cheater = new Y.Doc();
    paintFogBrush(cheater, 2, 2, 'reveal');
    const revealUpdate = Y.encodeStateAsUpdate(cheater);

    applyUpdateRespectingFog(server, revealUpdate, false);
    expect(captureFogSnapshot(server)).toEqual(before);
    restoreFogSnapshot(server, before);
    expect(captureFogSnapshot(server)).toEqual(before);
  });
});
