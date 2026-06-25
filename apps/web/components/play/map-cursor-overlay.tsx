'use client';

import type { TablePeer } from '@/hooks/use-table-awareness';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import { useEffect, useState } from 'react';

interface MapCursorOverlayProps {
  api: ExcalidrawImperativeAPI | null;
  peers: TablePeer[];
}

interface ViewportState {
  scrollX: number;
  scrollY: number;
  zoom: number;
}

export function MapCursorOverlay({ api, peers }: MapCursorOverlayProps) {
  const [viewport, setViewport] = useState<ViewportState>({ scrollX: 0, scrollY: 0, zoom: 1 });

  useEffect(() => {
    if (!api) return;
    setViewport({
      scrollX: api.getAppState().scrollX,
      scrollY: api.getAppState().scrollY,
      zoom: api.getAppState().zoom.value,
    });
    return api.onScrollChange((scrollX, scrollY, zoom) => {
      setViewport({ scrollX, scrollY, zoom: zoom.value });
    });
  }, [api]);

  const remote = peers.filter((peer) => !peer.isSelf && peer.cursor);

  if (remote.length === 0) return null;

  return (
    <svg className="pointer-events-none absolute inset-0 z-[3] h-full w-full overflow-hidden" aria-hidden>
      <g transform={`translate(${viewport.scrollX} ${viewport.scrollY}) scale(${viewport.zoom})`}>
        {remote.map((peer) => (
          <g key={peer.clientId} transform={`translate(${peer.cursor!.x} ${peer.cursor!.y})`}>
            <path
              d="M0 0 L0 14 L4 10 L7 16 L9 15 L6 9 L11 9 Z"
              fill={peer.color}
              stroke="#0a0a0a"
              strokeWidth={0.5}
            />
            <text x={12} y={10} fill={peer.color} fontSize={11} fontWeight={600}>
              {peer.name}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
