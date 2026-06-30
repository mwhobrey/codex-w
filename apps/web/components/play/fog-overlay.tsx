'use client';

import { sceneToOverlayPoint, type ExcalidrawViewport } from '@/lib/excalidraw-viewport-math';
import { FOG_CELL_SIZE, parseFogCellKey } from '@codex/sync';
import type { MapViewRole } from '@/lib/table-systems';
import { useMemo } from 'react';

interface FogOverlayProps {
  viewport: ExcalidrawViewport;
  hiddenCells: Set<string>;
  mapRole?: MapViewRole;
}

export function FogOverlay({ viewport, hiddenCells, mapRole = 'gm' }: FogOverlayProps) {
  const rects = useMemo(() => {
    return [...hiddenCells].flatMap((key) => {
      const parsed = parseFogCellKey(key);
      if (!parsed) return [];

      const sceneX = parsed.gx * FOG_CELL_SIZE;
      const sceneY = parsed.gy * FOG_CELL_SIZE;
      const topLeft = sceneToOverlayPoint(sceneX, sceneY, viewport);
      const bottomRight = sceneToOverlayPoint(
        sceneX + FOG_CELL_SIZE,
        sceneY + FOG_CELL_SIZE,
        viewport,
      );

      return [
        {
          key,
          x: topLeft.x,
          y: topLeft.y,
          width: bottomRight.x - topLeft.x,
          height: bottomRight.y - topLeft.y,
        },
      ];
    });
  }, [hiddenCells, viewport]);

  if (rects.length === 0) return null;

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[2] h-full w-full overflow-hidden"
      aria-hidden
    >
      {rects.map((rect) => (
        <rect
          key={rect.key}
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          fill={mapRole === 'gm' ? 'rgba(8, 8, 12, 0.35)' : 'rgba(8, 8, 12, 0.88)'}
          stroke={mapRole === 'gm' ? 'rgba(251, 146, 60, 0.45)' : 'rgba(0, 0, 0, 0.35)'}
          strokeWidth={1 / viewport.zoom}
        />
      ))}
    </svg>
  );
}

