'use client';

import { excalidrawSceneTransform, useExcalidrawViewport } from '@/hooks/use-excalidraw-viewport';
import type { TablePeer } from '@/hooks/use-table-awareness';
import { formatPlayerTag } from '@/lib/player-tag';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import { useRef } from 'react';

interface MapCursorOverlayProps {
  api: ExcalidrawImperativeAPI | null;
  peers: TablePeer[];
}

export function MapCursorOverlay({ api, peers }: MapCursorOverlayProps) {
  const anchorRef = useRef<SVGSVGElement>(null);
  const viewport = useExcalidrawViewport(api, anchorRef);
  const sceneTransform = excalidrawSceneTransform(viewport);

  const remote = peers.filter((peer) => !peer.isSelf && peer.cursor);

  if (remote.length === 0) return null;

  return (
    <svg
      ref={anchorRef}
      className="pointer-events-none absolute inset-0 z-[3] h-full w-full overflow-hidden"
      aria-hidden
    >
      <g transform={sceneTransform}>
        {remote.map((peer) => (
          <g key={peer.clientId} transform={`translate(${peer.cursor!.x} ${peer.cursor!.y})`}>
            <path
              d="M0 0 L0 14 L4 10 L7 16 L9 15 L6 9 L11 9 Z"
              fill={peer.color}
              stroke="#0a0a0a"
              strokeWidth={0.5}
            />
            <text x={12} y={10} fill={peer.color} fontSize={11} fontWeight={600}>
              {formatPlayerTag(peer.name, peer.characterName)}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
