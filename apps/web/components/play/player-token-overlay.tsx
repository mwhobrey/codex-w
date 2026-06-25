'use client';

import {
  movePlayerToken,
  PLAYER_TOKEN_RADIUS,
  type PlayerTokenView,
} from '@codex/sync';
import { formatPlayerTag } from '@/lib/player-tag';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import type * as Y from 'yjs';

interface PlayerTokenOverlayProps {
  doc: Y.Doc | null;
  api: ExcalidrawImperativeAPI | null;
  tokens: PlayerTokenView[];
  localClientId: number | null;
}

interface ViewportState {
  scrollX: number;
  scrollY: number;
  zoom: number;
}

function tokenInitials(token: PlayerTokenView): string {
  if (token.characterName?.trim()) {
    return token.characterName.trim().slice(0, 2).toUpperCase();
  }
  return token.playerName.trim().slice(0, 2).toUpperCase() || '??';
}

export function PlayerTokenOverlay({ doc, api, tokens, localClientId }: PlayerTokenOverlayProps) {
  const [viewport, setViewport] = useState<ViewportState>({ scrollX: 0, scrollY: 0, zoom: 1 });
  const dragRef = useRef<{
    key: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

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

  const scenePointFromEvent = useCallback(
    (clientX: number, clientY: number) => {
      if (!api) return null;
      const root = document.querySelector('.excalidraw');
      if (!(root instanceof HTMLElement)) return null;
      const bounds = root.getBoundingClientRect();
      const appState = api.getAppState();
      const zoom = appState.zoom.value;
      return {
        x: (clientX - bounds.left - appState.scrollX) / zoom,
        y: (clientY - bounds.top - appState.scrollY) / zoom,
      };
    },
    [api],
  );

  const onPointerDown = useCallback(
    (event: PointerEvent<SVGGElement>, token: PlayerTokenView) => {
      if (token.clientId !== localClientId || !doc) return;
      event.preventDefault();
      event.stopPropagation();
      (event.currentTarget as SVGElement).setPointerCapture(event.pointerId);

      const point = scenePointFromEvent(event.clientX, event.clientY);
      if (!point) return;

      dragRef.current = {
        key: token.key,
        offsetX: point.x - token.x,
        offsetY: point.y - token.y,
      };
    },
    [doc, localClientId, scenePointFromEvent],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent<SVGGElement>) => {
      const drag = dragRef.current;
      if (!drag || !doc) return;

      const point = scenePointFromEvent(event.clientX, event.clientY);
      if (!point) return;

      movePlayerToken(doc, drag.key, point.x - drag.offsetX, point.y - drag.offsetY);
    },
    [doc, scenePointFromEvent],
  );

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  if (tokens.length === 0) return null;

  const r = PLAYER_TOKEN_RADIUS;

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[4] h-full w-full overflow-hidden"
      data-testid="player-token-overlay"
      aria-label="Player tokens"
    >
      <g transform={`translate(${viewport.scrollX} ${viewport.scrollY}) scale(${viewport.zoom})`}>
        {tokens.map((token) => {
          const isOwn = token.clientId === localClientId;
          const label = formatPlayerTag(token.playerName, token.characterName);
          return (
            <g
              key={token.key}
              transform={`translate(${token.x} ${token.y})`}
              className={isOwn ? 'pointer-events-auto cursor-grab active:cursor-grabbing' : ''}
              onPointerDown={(event) => onPointerDown(event, token)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <circle
                r={r}
                fill={token.color}
                fillOpacity={0.88}
                stroke="#0a0a0a"
                strokeWidth={1.5}
              />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fill="#0a0a0a"
                fontSize={r * 0.72}
                fontWeight={700}
                pointerEvents="none"
              >
                {tokenInitials(token)}
              </text>
              <text
                y={r + 14}
                textAnchor="middle"
                fill={token.color}
                fontSize={10}
                fontWeight={600}
                pointerEvents="none"
              >
                {label.length > 18 ? `${label.slice(0, 16)}…` : label}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
