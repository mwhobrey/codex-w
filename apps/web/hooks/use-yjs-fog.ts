'use client';

import {
  FOG_CELL_SIZE,
  getPlayRoomFogMap,
  paintFogBrush,
  parseFogCellKey,
  sceneToFogCell,
} from '@codex/sync';
import { useCallback, useEffect, useState } from 'react';
import type * as Y from 'yjs';

export function useYjsFog(doc: Y.Doc | null) {
  const [hiddenCells, setHiddenCells] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!doc) {
      setHiddenCells(new Set());
      return;
    }

    const yFog = getPlayRoomFogMap(doc);
    const sync = () => {
      const next = new Set<string>();
      yFog.forEach((_value, key) => {
        next.add(key);
      });
      setHiddenCells(next);
    };

    sync();
    yFog.observe(sync);
    return () => {
      yFog.unobserve(sync);
    };
  }, [doc]);

  const paintAtScene = useCallback(
    (sceneX: number, sceneY: number, mode: 'hide' | 'reveal', radius = 1) => {
      if (!doc) return;
      const { gx, gy } = sceneToFogCell(sceneX, sceneY, FOG_CELL_SIZE);
      paintFogBrush(doc, gx, gy, mode, radius);
    },
    [doc],
  );

  const clearAllFog = useCallback(() => {
    if (!doc) return;
    const yFog = getPlayRoomFogMap(doc);
    doc.transact(() => {
      yFog.forEach((_value, key) => {
        yFog.delete(key);
      });
    });
  }, [doc]);

  return { hiddenCells, paintAtScene, clearAllFog, cellSize: FOG_CELL_SIZE, parseFogCellKey };
}
