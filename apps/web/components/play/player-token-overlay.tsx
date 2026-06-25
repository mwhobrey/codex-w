'use client';

import { useCharacterPortraits } from '@/hooks/use-character-portraits';
import { formatPlayerTag } from '@/lib/player-tag';
import type { MapViewRole } from '@/lib/table-systems';
import {
  DEFAULT_PLAYER_TOKEN_RADIUS,
  isScenePointFogged,
  MAX_PLAYER_TOKEN_RADIUS,
  MIN_PLAYER_TOKEN_RADIUS,
  snapTokenPosition,
  updatePlayerToken,
  type PlayerTokenView,
} from '@codex/sync';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import type * as Y from 'yjs';

interface PlayerTokenOverlayProps {
  doc: Y.Doc | null;
  api: ExcalidrawImperativeAPI | null;
  tokens: PlayerTokenView[];
  localClientId: number | null;
  mapRole?: MapViewRole;
  isTableGm?: boolean;
  hiddenCells: Set<string>;
}

interface ViewportState {
  scrollX: number;
  scrollY: number;
  zoom: number;
}

type InteractionMode = 'move' | 'resize';

interface InteractionState {
  key: string;
  mode: InteractionMode;
  offsetX: number;
  offsetY: number;
}

function tokenInitials(token: PlayerTokenView): string {
  if (token.characterName?.trim()) {
    return token.characterName.trim().slice(0, 2).toUpperCase();
  }
  return token.playerName.trim().slice(0, 2).toUpperCase() || '??';
}

function canManipulateToken(
  token: PlayerTokenView,
  localClientId: number | null,
  isTableGm: boolean,
): boolean {
  return isTableGm || token.clientId === localClientId;
}

export function PlayerTokenOverlay({
  doc,
  api,
  tokens,
  localClientId,
  mapRole = 'gm',
  isTableGm = false,
  hiddenCells,
}: PlayerTokenOverlayProps) {
  const [viewport, setViewport] = useState<ViewportState>({ scrollX: 0, scrollY: 0, zoom: 1 });
  const interactionRef = useRef<InteractionState | null>(null);
  const characterIds = useMemo(() => tokens.map((token) => token.characterId), [tokens]);
  const portraits = useCharacterPortraits(characterIds);

  const visibleTokens = useMemo(() => {
    if (mapRole === 'gm') return tokens;
    return tokens.filter((token) => !isScenePointFogged(token.x, token.y, hiddenCells));
  }, [hiddenCells, mapRole, tokens]);

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

  const finishInteraction = useCallback(
    (key: string, x: number, y: number) => {
      if (!doc) return;
      const snapped = snapTokenPosition(x, y);
      updatePlayerToken(doc, key, { x: snapped.x, y: snapped.y });
    },
    [doc],
  );

  const onMovePointerDown = useCallback(
    (event: PointerEvent<SVGCircleElement>, token: PlayerTokenView) => {
      if (!canManipulateToken(token, localClientId, isTableGm) || !doc) return;
      event.preventDefault();
      event.stopPropagation();
      (event.currentTarget as SVGElement).setPointerCapture(event.pointerId);

      const point = scenePointFromEvent(event.clientX, event.clientY);
      if (!point) return;

      interactionRef.current = {
        key: token.key,
        mode: 'move',
        offsetX: point.x - token.x,
        offsetY: point.y - token.y,
      };
    },
    [doc, isTableGm, localClientId, scenePointFromEvent],
  );

  const onResizePointerDown = useCallback(
    (event: PointerEvent<SVGCircleElement>, token: PlayerTokenView) => {
      if (!canManipulateToken(token, localClientId, isTableGm) || !doc) return;
      event.preventDefault();
      event.stopPropagation();
      (event.currentTarget as SVGElement).setPointerCapture(event.pointerId);

      interactionRef.current = {
        key: token.key,
        mode: 'resize',
        offsetX: 0,
        offsetY: 0,
      };
    },
    [doc, isTableGm, localClientId],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent<SVGElement>) => {
      const interaction = interactionRef.current;
      if (!interaction || !doc) return;

      const point = scenePointFromEvent(event.clientX, event.clientY);
      if (!point) return;

      if (interaction.mode === 'move') {
        updatePlayerToken(doc, interaction.key, {
          x: point.x - interaction.offsetX,
          y: point.y - interaction.offsetY,
        });
        return;
      }

      const token = tokens.find((item) => item.key === interaction.key);
      if (!token) return;
      const distance = Math.hypot(point.x - token.x, point.y - token.y);
      const radius = Math.min(
        MAX_PLAYER_TOKEN_RADIUS,
        Math.max(MIN_PLAYER_TOKEN_RADIUS, distance),
      );
      updatePlayerToken(doc, interaction.key, { radius });
    },
    [doc, scenePointFromEvent, tokens],
  );

  const onPointerUp = useCallback(
    (event: PointerEvent<SVGElement>) => {
      const interaction = interactionRef.current;
      if (!interaction || !doc) {
        interactionRef.current = null;
        return;
      }

      if (interaction.mode === 'move') {
        const token = tokens.find((item) => item.key === interaction.key);
        if (token) {
          finishInteraction(interaction.key, token.x, token.y);
        }
      }

      interactionRef.current = null;
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // capture may already be released
      }
    },
    [doc, finishInteraction, tokens],
  );

  if (visibleTokens.length === 0) return null;

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[4] h-full w-full overflow-hidden"
      data-testid="player-token-overlay"
      aria-label="Player tokens"
    >
      <defs>
        {visibleTokens.map((token) => {
          const portrait = portraits.get(token.characterId);
          if (!portrait) return null;
          const r = token.radius ?? DEFAULT_PLAYER_TOKEN_RADIUS;
          return (
            <clipPath key={`clip-${token.key}`} id={`player-token-clip-${token.key}`}>
              <circle r={r} />
            </clipPath>
          );
        })}
      </defs>

      <g transform={`translate(${viewport.scrollX} ${viewport.scrollY}) scale(${viewport.zoom})`}>
        {visibleTokens.map((token) => {
          const r = token.radius ?? DEFAULT_PLAYER_TOKEN_RADIUS;
          const label = formatPlayerTag(token.playerName, token.characterName);
          const portrait = portraits.get(token.characterId);
          const manipulable = canManipulateToken(token, localClientId, isTableGm);
          const fogged =
            isTableGm && mapRole === 'gm' && isScenePointFogged(token.x, token.y, hiddenCells);
          const opacity = fogged ? 0.42 : 1;

          return (
            <g
              key={token.key}
              transform={`translate(${token.x} ${token.y})`}
              opacity={opacity}
            >
              {portrait ? (
                <image
                  href={portrait}
                  x={-r}
                  y={-r}
                  width={r * 2}
                  height={r * 2}
                  clipPath={`url(#player-token-clip-${token.key})`}
                  preserveAspectRatio="xMidYMid slice"
                  pointerEvents="none"
                />
              ) : null}

              <circle
                r={r}
                fill={portrait ? 'transparent' : token.color}
                fillOpacity={portrait ? 0 : 0.88}
                stroke={token.color}
                strokeWidth={portrait ? 3 : 1.5}
                className={
                  manipulable ? 'pointer-events-auto cursor-grab active:cursor-grabbing' : ''
                }
                onPointerDown={(event) => onMovePointerDown(event, token)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
              />

              {!portrait ? (
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
              ) : null}

              {manipulable ? (
                <circle
                  cx={r * 0.72}
                  cy={r * 0.72}
                  r={5}
                  fill="#f8fafc"
                  stroke={token.color}
                  strokeWidth={1.5}
                  className="pointer-events-auto cursor-nwse-resize"
                  data-testid={`player-token-resize-${token.key}`}
                  onPointerDown={(event) => onResizePointerDown(event, token)}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                />
              ) : null}

              <text
                y={r + 14}
                textAnchor="middle"
                fill={token.color}
                fontSize={10}
                fontWeight={600}
                pointerEvents="none"
              >
                {label.length > 22 ? `${label.slice(0, 20)}…` : label}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
