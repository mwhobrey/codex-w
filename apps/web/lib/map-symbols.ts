'use client';

import type { SceneBounds } from '@/lib/map-bounds';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';

export type CodexMapKind = 'terrain' | 'structure' | 'token';

export type CodexMapTool = 'select' | 'stamp' | 'fog-hide' | 'fog-reveal';

export interface CodexMapSymbol {
  id: string;
  label: string;
  kind: CodexMapKind;
  category: string;
  hint: string;
}

const CODEX_CUSTOM = (kind: CodexMapKind, type: string, extra?: Record<string, unknown>) => ({
  codexKind: kind,
  codexType: type,
  ...extra,
});

export interface CodexTokenOptions {
  label?: string;
  characterId?: string;
  characterName?: string;
}

function tokenSkeleton(
  bounds: SceneBounds,
  type: string,
  fill: string,
  stroke: string,
  letter: string,
  tokenOptions?: CodexTokenOptions,
) {
  const fontSize = Math.max(14, Math.min(bounds.width, bounds.height) * 0.38);
  const labelText =
    tokenOptions?.label?.slice(0, 2).toUpperCase() ??
    (tokenOptions?.characterName?.[0]?.toUpperCase() ?? letter);
  return [
    {
      type: 'ellipse' as const,
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      backgroundColor: fill,
      strokeColor: stroke,
      fillStyle: 'solid' as const,
      strokeWidth: 2,
      label: { text: labelText, fontSize },
      customData: CODEX_CUSTOM('token', type, {
        characterId: tokenOptions?.characterId,
        characterName: tokenOptions?.characterName,
        displayLabel: tokenOptions?.label ?? tokenOptions?.characterName,
      }),
    },
  ];
}

function skeletonForSymbol(
  symbolId: string,
  bounds: SceneBounds,
  groupId?: string,
  tokenOptions?: CodexTokenOptions,
) {
  const groupIds = groupId ? [groupId] : undefined;
  const { x, y, width, height } = bounds;
  const cx = x + width / 2;
  const cy = y + height / 2;

  switch (symbolId) {
    case 'token-player':
      return tokenSkeleton(bounds, 'player', '#93c5fd', '#1d4ed8', 'P', tokenOptions);
    case 'token-npc':
      return tokenSkeleton(bounds, 'npc', '#fca5a5', '#b91c1c', 'N', tokenOptions);
    case 'token-monster':
      return tokenSkeleton(bounds, 'monster', '#d8b4fe', '#7e22ce', 'M', tokenOptions);
    case 'token-ally':
      return tokenSkeleton(bounds, 'ally', '#86efac', '#15803d', 'A', tokenOptions);
    case 'grass':
      return [
        {
          type: 'rectangle' as const,
          x,
          y,
          width,
          height,
          backgroundColor: '#4ade80',
          strokeColor: '#166534',
          fillStyle: 'solid' as const,
          opacity: 70,
          groupIds,
          customData: CODEX_CUSTOM('terrain', 'grass'),
        },
      ];
    case 'water':
      return [
        {
          type: 'ellipse' as const,
          x,
          y,
          width,
          height,
          backgroundColor: '#38bdf8',
          strokeColor: '#0369a1',
          fillStyle: 'solid' as const,
          opacity: 65,
          groupIds,
          customData: CODEX_CUSTOM('terrain', 'water'),
        },
      ];
    case 'sand':
      return [
        {
          type: 'rectangle' as const,
          x,
          y,
          width,
          height,
          backgroundColor: '#fde68a',
          strokeColor: '#b45309',
          fillStyle: 'hachure' as const,
          opacity: 80,
          groupIds,
          customData: CODEX_CUSTOM('terrain', 'sand'),
        },
      ];
    case 'forest':
      return [
        {
          type: 'ellipse' as const,
          x,
          y,
          width,
          height,
          backgroundColor: '#15803d',
          strokeColor: '#14532d',
          fillStyle: 'cross-hatch' as const,
          opacity: 75,
          groupIds,
          customData: CODEX_CUSTOM('terrain', 'forest'),
        },
      ];
    case 'rock':
      return [
        {
          type: 'diamond' as const,
          x,
          y,
          width,
          height,
          backgroundColor: '#a8a29e',
          strokeColor: '#44403c',
          fillStyle: 'solid' as const,
          opacity: 90,
          groupIds,
          customData: CODEX_CUSTOM('terrain', 'rock'),
        },
      ];
    case 'house':
      return [
        {
          type: 'rectangle' as const,
          x,
          y: y + height * 0.35,
          width,
          height: height * 0.65,
          backgroundColor: '#fef3c7',
          strokeColor: '#78350f',
          fillStyle: 'solid' as const,
          groupIds,
          customData: CODEX_CUSTOM('structure', 'house'),
        },
        {
          type: 'line' as const,
          x,
          y: y + height * 0.35,
          width,
          height: height * 0.4,
          strokeColor: '#78350f',
          groupIds,
          customData: CODEX_CUSTOM('structure', 'house-roof'),
        },
      ];
    case 'tower':
      return [
        {
          type: 'rectangle' as const,
          x: cx - width * 0.2,
          y,
          width: width * 0.4,
          height,
          backgroundColor: '#e7e5e4',
          strokeColor: '#292524',
          fillStyle: 'solid' as const,
          groupIds,
          customData: CODEX_CUSTOM('structure', 'tower'),
        },
      ];
    case 'bridge':
      return [
        {
          type: 'rectangle' as const,
          x,
          y: cy - height * 0.15,
          width,
          height: height * 0.3,
          backgroundColor: '#d6d3d1',
          strokeColor: '#57534e',
          fillStyle: 'solid' as const,
          groupIds,
          customData: CODEX_CUSTOM('structure', 'bridge'),
        },
      ];
    case 'ruins':
      return [
        {
          type: 'rectangle' as const,
          x,
          y: y + height * 0.15,
          width: width * 0.45,
          height: height * 0.85,
          backgroundColor: '#a8a29e',
          strokeColor: '#44403c',
          fillStyle: 'cross-hatch' as const,
          groupIds,
          customData: CODEX_CUSTOM('structure', 'ruins'),
        },
        {
          type: 'rectangle' as const,
          x: x + width * 0.5,
          y: y + height * 0.28,
          width: width * 0.35,
          height: height * 0.72,
          backgroundColor: '#a8a29e',
          strokeColor: '#44403c',
          fillStyle: 'cross-hatch' as const,
          groupIds,
          customData: CODEX_CUSTOM('structure', 'ruins'),
        },
      ];
    case 'camp':
      return [
        {
          type: 'ellipse' as const,
          x,
          y: y + height * 0.1,
          width,
          height: height * 0.9,
          backgroundColor: '#fdba74',
          strokeColor: '#9a3412',
          fillStyle: 'solid' as const,
          groupIds,
          customData: CODEX_CUSTOM('structure', 'camp'),
        },
        {
          type: 'text' as const,
          x: cx - 12,
          y: cy - 10,
          text: '⛺',
          fontSize: Math.max(16, Math.min(width, height) * 0.35),
          groupIds,
          customData: CODEX_CUSTOM('structure', 'camp'),
        },
      ];
    default:
      return [
        {
          type: 'rectangle' as const,
          x,
          y,
          width: Math.max(width, 24),
          height: Math.max(height, 24),
          backgroundColor: '#c4b5fd',
          strokeColor: '#5b21b6',
          groupIds,
          customData: CODEX_CUSTOM('terrain', 'unknown'),
        },
      ];
  }
}

export const CODEX_MAP_SYMBOLS: CodexMapSymbol[] = [
  { id: 'grass', label: 'Grass', kind: 'terrain', category: 'Ground', hint: 'Open field' },
  { id: 'water', label: 'Water', kind: 'terrain', category: 'Ground', hint: 'River or pond' },
  { id: 'sand', label: 'Sand', kind: 'terrain', category: 'Ground', hint: 'Beach or desert' },
  { id: 'forest', label: 'Forest', kind: 'terrain', category: 'Ground', hint: 'Woods' },
  { id: 'rock', label: 'Rock', kind: 'terrain', category: 'Ground', hint: 'Boulders or cliff' },
  { id: 'house', label: 'House', kind: 'structure', category: 'Buildings', hint: 'Cottage or shop' },
  { id: 'tower', label: 'Tower', kind: 'structure', category: 'Buildings', hint: 'Keep or watchtower' },
  { id: 'bridge', label: 'Bridge', kind: 'structure', category: 'Buildings', hint: 'Crossing' },
  { id: 'ruins', label: 'Ruins', kind: 'structure', category: 'Buildings', hint: 'Collapsed walls' },
  { id: 'camp', label: 'Camp', kind: 'structure', category: 'Buildings', hint: 'Traveler camp' },
  {
    id: 'token-player',
    label: 'Player',
    kind: 'token',
    category: 'Tokens',
    hint: 'Player character token',
  },
  { id: 'token-npc', label: 'NPC', kind: 'token', category: 'Tokens', hint: 'Non-player character' },
  {
    id: 'token-monster',
    label: 'Monster',
    kind: 'token',
    category: 'Tokens',
    hint: 'Hostile creature',
  },
  { id: 'token-ally', label: 'Ally', kind: 'token', category: 'Tokens', hint: 'Friendly NPC' },
];

export async function createCodexSymbolElements(
  symbolId: string,
  bounds: SceneBounds,
  tokenOptions?: CodexTokenOptions,
): Promise<ExcalidrawElement[]> {
  const { convertToExcalidrawElements } = await import('@excalidraw/excalidraw');
  const needsGroup = !symbolId.startsWith('token-');
  const groupId = needsGroup ? crypto.randomUUID() : undefined;
  const skeleton = skeletonForSymbol(symbolId, bounds, groupId, tokenOptions);
  return convertToExcalidrawElements(skeleton, { regenerateIds: true });
}

export function getCodexSymbol(id: string): CodexMapSymbol | undefined {
  return CODEX_MAP_SYMBOLS.find((symbol) => symbol.id === id);
}

export function isFogTool(tool: CodexMapTool): boolean {
  return tool === 'fog-hide' || tool === 'fog-reveal';
}
