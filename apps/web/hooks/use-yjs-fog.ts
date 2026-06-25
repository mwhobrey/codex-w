'use client';

import { FOG_CELL_SIZE, getPlayRoomFogMap, paintFogRect } from '@codex/sync';
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

  const paintRectAtScene = useCallback(
    (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      mode: 'hide' | 'reveal',
    ) => {
      if (!doc) return;
      paintFogRect(doc, x1, y1, x2, y2, mode, FOG_CELL_SIZE);
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

  return { hiddenCells, paintRectAtScene, clearAllFog, cellSize: FOG_CELL_SIZE };
}
