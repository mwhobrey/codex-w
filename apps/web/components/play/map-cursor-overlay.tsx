'use client';

import { excalidrawSceneTransform, type ExcalidrawViewport } from '@/lib/excalidraw-viewport-math';
import type { TablePeer } from '@/hooks/use-table-awareness';
import { formatPlayerTag } from '@/lib/player-tag';

interface MapCursorOverlayProps {
  viewport: ExcalidrawViewport;
  peers: TablePeer[];
}

export function MapCursorOverlay({ viewport, peers }: MapCursorOverlayProps) {
  const sceneTransform = excalidrawSceneTransform(viewport);

  const remote = peers.filter((peer) => !peer.isSelf && peer.cursor);

  if (remote.length === 0) return null;

  return (
    <svg
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

