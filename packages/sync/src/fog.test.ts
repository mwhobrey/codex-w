import { describe, expect, it } from 'vitest';
import * as Y from 'yjs';
import {
  fogCellKey,
  isScenePointFogged,
  paintFogRect,
  readHiddenFogCells,
  sceneToFogCell,
} from './yjs/fog';
import { createPlayRoomDoc } from './yjs/play-room-doc';

describe('fog of war', () => {
  it('maps scene coordinates to fog cells', () => {
    expect(sceneToFogCell(0, 0)).toEqual({ gx: 0, gy: 0 });
    expect(sceneToFogCell(47, 95)).toEqual({ gx: 0, gy: 1 });
    expect(fogCellKey(2, 3)).toBe('2,3');
  });

  it('paints and reads hidden rectangles', () => {
    const doc = createPlayRoomDoc();
    paintFogRect(doc, 10, 10, 60, 60, 'hide');
    const hidden = readHiddenFogCells(doc);
    expect(hidden.has('0,0')).toBe(true);
    expect(isScenePointFogged(20, 20, hidden)).toBe(true);
    expect(isScenePointFogged(200, 200, hidden)).toBe(false);
  });

  it('reveals painted fog', () => {
    const doc = createPlayRoomDoc();
    paintFogRect(doc, 0, 0, 48, 48, 'hide');
    paintFogRect(doc, 0, 0, 48, 48, 'reveal');
    const hidden = readHiddenFogCells(doc);
    expect(hidden.size).toBe(0);
  });
});
