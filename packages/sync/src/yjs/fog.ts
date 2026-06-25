import type * as Y from 'yjs';
import { getPlayRoomFogMap, PLAY_ROOM_KEYS } from './play-room-doc';

export const FOG_CELL_SIZE = 48;

export function fogCellKey(gx: number, gy: number): string {
  return `${gx},${gy}`;
}

export function parseFogCellKey(key: string): { gx: number; gy: number } | null {
  const [gxRaw, gyRaw] = key.split(',');
  const gx = Number(gxRaw);
  const gy = Number(gyRaw);
  if (!Number.isFinite(gx) || !Number.isFinite(gy)) return null;
  return { gx, gy };
}

export function sceneToFogCell(sceneX: number, sceneY: number, cellSize = FOG_CELL_SIZE) {
  return {
    gx: Math.floor(sceneX / cellSize),
    gy: Math.floor(sceneY / cellSize),
  };
}

export function readHiddenFogCells(doc: Y.Doc): Set<string> {
  const hidden = new Set<string>();
  getPlayRoomFogMap(doc).forEach((_value, key) => {
    hidden.add(key);
  });
  return hidden;
}

export function setFogCellHidden(
  doc: Y.Doc,
  gx: number,
  gy: number,
  hidden: boolean,
): void {
  const key = fogCellKey(gx, gy);
  const yFog = getPlayRoomFogMap(doc);
  doc.transact(() => {
    if (hidden) yFog.set(key, true);
    else yFog.delete(key);
  }, PLAY_ROOM_KEYS.FOG);
}

export function paintFogBrush(
  doc: Y.Doc,
  centerGx: number,
  centerGy: number,
  mode: 'hide' | 'reveal',
  radius = 1,
): void {
  const yFog = getPlayRoomFogMap(doc);
  doc.transact(() => {
    for (let dx = -radius; dx <= radius; dx += 1) {
      for (let dy = -radius; dy <= radius; dy += 1) {
        const key = fogCellKey(centerGx + dx, centerGy + dy);
        if (mode === 'hide') yFog.set(key, true);
        else yFog.delete(key);
      }
    }
  }, PLAY_ROOM_KEYS.FOG);
}

export function paintFogRect(
  doc: Y.Doc,
  minSceneX: number,
  minSceneY: number,
  maxSceneX: number,
  maxSceneY: number,
  mode: 'hide' | 'reveal',
  cellSize = FOG_CELL_SIZE,
): void {
  const minGx = Math.floor(Math.min(minSceneX, maxSceneX) / cellSize);
  const maxGx = Math.floor(Math.max(minSceneX, maxSceneX) / cellSize);
  const minGy = Math.floor(Math.min(minSceneY, maxSceneY) / cellSize);
  const maxGy = Math.floor(Math.max(minSceneY, maxSceneY) / cellSize);

  const yFog = getPlayRoomFogMap(doc);
  doc.transact(() => {
    for (let gx = minGx; gx <= maxGx; gx += 1) {
      for (let gy = minGy; gy <= maxGy; gy += 1) {
        const key = fogCellKey(gx, gy);
        if (mode === 'hide') yFog.set(key, true);
        else yFog.delete(key);
      }
    }
  }, PLAY_ROOM_KEYS.FOG);
}
