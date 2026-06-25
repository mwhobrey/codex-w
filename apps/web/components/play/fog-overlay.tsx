'use client';

import { FOG_CELL_SIZE, parseFogCellKey } from '@codex/sync';
import type { MapViewRole } from '@/lib/table-systems';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import { useEffect, useMemo, useState } from 'react';

interface FogOverlayProps {
  api: ExcalidrawImperativeAPI | null;
  hiddenCells: Set<string>;
  mapRole?: MapViewRole;
}

interface ViewportState {
  scrollX: number;
  scrollY: number;
  zoom: number;
}

function readViewport(api: ExcalidrawImperativeAPI): ViewportState {
  const state = api.getAppState();
  return {
    scrollX: state.scrollX,
    scrollY: state.scrollY,
    zoom: state.zoom.value,
  };
}

export function FogOverlay({ api, hiddenCells, mapRole = 'gm' }: FogOverlayProps) {
  const [viewport, setViewport] = useState<ViewportState>({
    scrollX: 0,
    scrollY: 0,
    zoom: 1,
  });

  useEffect(() => {
    if (!api) return;
    setViewport(readViewport(api));
    return api.onScrollChange((scrollX, scrollY, zoom) => {
      setViewport({ scrollX, scrollY, zoom: zoom.value });
    });
  }, [api]);

  const rects = useMemo(() => {
    return [...hiddenCells].flatMap((key) => {
      const parsed = parseFogCellKey(key);
      if (!parsed) return [];
      return [
        {
          key,
          x: parsed.gx * FOG_CELL_SIZE,
          y: parsed.gy * FOG_CELL_SIZE,
        },
      ];
    });
  }, [hiddenCells]);

  if (rects.length === 0) return null;

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[2] h-full w-full overflow-hidden"
      aria-hidden
    >
      <g
        transform={`translate(${viewport.scrollX} ${viewport.scrollY}) scale(${viewport.zoom})`}
      >
        {rects.map((rect) => (
          <rect
            key={rect.key}
            x={rect.x}
            y={rect.y}
            width={FOG_CELL_SIZE}
            height={FOG_CELL_SIZE}
            fill={mapRole === 'gm' ? 'rgba(8, 8, 12, 0.35)' : 'rgba(8, 8, 12, 0.88)'}
            stroke={mapRole === 'gm' ? 'rgba(251, 146, 60, 0.45)' : 'rgba(0, 0, 0, 0.35)'}
            strokeWidth={1 / viewport.zoom}
          />
        ))}
      </g>
    </svg>
  );
}
