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
import { type ExcalidrawViewport, excalidrawSceneTransform, viewportToScenePoint } from '@/lib/excalidraw-viewport-math';
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent, type KeyboardEvent } from 'react';
import type * as Y from 'yjs';

interface PlayerTokenOverlayProps {
  doc: Y.Doc | null;
  viewport: ExcalidrawViewport;
  tokens: PlayerTokenView[];
  localClientId: number | null;
  mapRole?: MapViewRole;
  isTableGm?: boolean;
  hiddenCells: Set<string>;
}

type InteractionMode = 'move' | 'resize';

interface InteractionState {
  key: string;
  mode: InteractionMode;
  offsetX: number;
  offsetY: number;
  offsetLeft: number;
  offsetTop: number;
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
  viewport,
  tokens,
  localClientId,
  mapRole = 'gm',
  isTableGm = false,
  hiddenCells,
}: PlayerTokenOverlayProps) {
  const interactionRef = useRef<InteractionState | null>(null);
  const dragPositionRef = useRef<{ key: string; x: number; y: number } | null>(null);
  const syncThrottleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, bumpDragFrame] = useState(0);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<SVGGElement>, token: PlayerTokenView) => {
      if (!doc) return;
      const step = event.shiftKey ? 6 : 24;
      let nextX = token.x;
      let nextY = token.y;
      switch (event.key) {
        case 'ArrowLeft':
          nextX -= step;
          break;
        case 'ArrowRight':
          nextX += step;
          break;
        case 'ArrowUp':
          nextY -= step;
          break;
        case 'ArrowDown':
          nextY += step;
          break;
        default:
          return;
      }
      event.preventDefault();
      event.stopPropagation();
      const snapped = snapTokenPosition(nextX, nextY);
      updatePlayerToken(doc, token.key, { x: snapped.x, y: snapped.y });
    },
    [doc],
  );
  const characterIds = useMemo(() => tokens.map((token) => token.characterId), [tokens]);
  const portraits = useCharacterPortraits(characterIds);
  const sceneTransform = excalidrawSceneTransform(viewport);

  const visibleTokens = useMemo(() => {
    if (mapRole === 'gm') return tokens;
    return tokens.filter((token) => !isScenePointFogged(token.x, token.y, hiddenCells));
  }, [hiddenCells, mapRole, tokens]);

  const finishInteraction = useCallback(
    (key: string, x: number, y: number) => {
      if (!doc) return;
      const snapped = snapTokenPosition(x, y);
      updatePlayerToken(doc, key, { x: snapped.x, y: snapped.y });
    },
    [doc],
  );

  const queueDragSync = useCallback(
    (key: string, x: number, y: number) => {
      if (!doc) return;
      if (syncThrottleRef.current) return;
      syncThrottleRef.current = setTimeout(() => {
        syncThrottleRef.current = null;
        updatePlayerToken(doc, key, { x, y });
      }, 100);
    },
    [doc],
  );

  useEffect(
    () => () => {
      if (syncThrottleRef.current) clearTimeout(syncThrottleRef.current);
    },
    [],
  );

  const displayPosition = useCallback(
    (token: PlayerTokenView) => {
      const drag = dragPositionRef.current;
      if (drag?.key === token.key) {
        return { x: drag.x, y: drag.y };
      }
      return { x: token.x, y: token.y };
    },
    [],
  );

  const onMovePointerDown = useCallback(
    (event: PointerEvent<SVGCircleElement>, token: PlayerTokenView) => {
      if (!canManipulateToken(token, localClientId, isTableGm) || !doc) return;
      event.preventDefault();
      event.stopPropagation();
      (event.currentTarget as SVGElement).setPointerCapture(event.pointerId);

      const root = document.querySelector('.excalidraw');
      if (!(root instanceof HTMLElement)) return;
      const bounds = root.getBoundingClientRect();
      const offsetLeft = bounds.left;
      const offsetTop = bounds.top;

      const point = viewportToScenePoint(event.clientX, event.clientY, viewport, offsetLeft, offsetTop);
      if (!point) return;

      interactionRef.current = {
        key: token.key,
        mode: 'move',
        offsetX: point.x - token.x,
        offsetY: point.y - token.y,
        offsetLeft,
        offsetTop,
      };
    },
    [doc, isTableGm, localClientId, viewport],
  );

  const onResizePointerDown = useCallback(
    (event: PointerEvent<SVGCircleElement>, token: PlayerTokenView) => {
      if (!canManipulateToken(token, localClientId, isTableGm) || !doc) return;
      event.preventDefault();
      event.stopPropagation();
      (event.currentTarget as SVGElement).setPointerCapture(event.pointerId);

      const root = document.querySelector('.excalidraw');
      if (!(root instanceof HTMLElement)) return;
      const bounds = root.getBoundingClientRect();

      interactionRef.current = {
        key: token.key,
        mode: 'resize',
        offsetX: 0,
        offsetY: 0,
        offsetLeft: bounds.left,
        offsetTop: bounds.top,
      };
    },
    [doc, isTableGm, localClientId],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent<SVGElement>) => {
      const interaction = interactionRef.current;
      if (!interaction || !doc) return;

      const point = viewportToScenePoint(
        event.clientX,
        event.clientY,
        viewport,
        interaction.offsetLeft,
        interaction.offsetTop,
      );
      if (!point) return;

      if (interaction.mode === 'move') {
        const x = point.x - interaction.offsetX;
        const y = point.y - interaction.offsetY;
        dragPositionRef.current = { key: interaction.key, x, y };
        bumpDragFrame((value) => value + 1);
        queueDragSync(interaction.key, x, y);
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
    [doc, tokens, viewport],
  );

  const onPointerUp = useCallback(
    (event: PointerEvent<SVGElement>) => {
      const interaction = interactionRef.current;
      if (!interaction || !doc) {
        interactionRef.current = null;
        return;
      }

      if (interaction.mode === 'move') {
        const drag = dragPositionRef.current;
        if (drag?.key === interaction.key) {
          if (syncThrottleRef.current) {
            clearTimeout(syncThrottleRef.current);
            syncThrottleRef.current = null;
          }
          finishInteraction(interaction.key, drag.x, drag.y);
        } else {
          const token = tokens.find((item) => item.key === interaction.key);
          if (token) finishInteraction(interaction.key, token.x, token.y);
        }
        dragPositionRef.current = null;
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

      <g transform={sceneTransform}>
        {visibleTokens.map((token) => {
          const position = displayPosition(token);
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
              transform={`translate(${position.x} ${position.y})`}
              opacity={opacity}
              tabIndex={manipulable ? 0 : undefined}
              role={manipulable ? 'button' : undefined}
              aria-label={
                manipulable
                  ? `Player token for ${label}. Use arrow keys to move, hold Shift for smaller steps.`
                  : `Player token for ${label}.`
              }
              onKeyDown={manipulable ? (event) => handleKeyDown(event, token) : undefined}
              className={manipulable ? 'group outline-none' : ''}
            >
              {manipulable && (
                <circle
                  r={r + 4}
                  fill="none"
                  stroke={token.color}
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  className="opacity-0 transition-opacity group-focus-visible:opacity-100 pointer-events-none"
                />
              )}
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
