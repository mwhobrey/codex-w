'use client';

import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';

export type CodexMapKind = 'terrain' | 'structure';

export interface CodexMapSymbol {
  id: string;
  label: string;
  kind: CodexMapKind;
  category: string;
  /** Short hint for toolbar tooltips */
  hint: string;
}

const CODEX_CUSTOM = (kind: CodexMapKind, type: string) => ({
  codexKind: kind,
  codexType: type,
});

function skeletonForSymbol(symbolId: string, x: number, y: number) {
  const size = 80;
  const half = size / 2;

  switch (symbolId) {
    case 'grass':
      return [
        {
          type: 'rectangle' as const,
          x: x - half,
          y: y - half,
          width: size,
          height: size,
          backgroundColor: '#4ade80',
          strokeColor: '#166534',
          fillStyle: 'solid' as const,
          opacity: 70,
          customData: CODEX_CUSTOM('terrain', 'grass'),
        },
      ];
    case 'water':
      return [
        {
          type: 'ellipse' as const,
          x: x - half,
          y: y - half,
          width: size,
          height: size * 0.75,
          backgroundColor: '#38bdf8',
          strokeColor: '#0369a1',
          fillStyle: 'solid' as const,
          opacity: 65,
          customData: CODEX_CUSTOM('terrain', 'water'),
        },
      ];
    case 'sand':
      return [
        {
          type: 'rectangle' as const,
          x: x - half,
          y: y - half,
          width: size,
          height: size,
          backgroundColor: '#fde68a',
          strokeColor: '#b45309',
          fillStyle: 'hachure' as const,
          opacity: 80,
          customData: CODEX_CUSTOM('terrain', 'sand'),
        },
      ];
    case 'forest':
      return [
        {
          type: 'ellipse' as const,
          x: x - half,
          y: y - half,
          width: size,
          height: size,
          backgroundColor: '#15803d',
          strokeColor: '#14532d',
          fillStyle: 'cross-hatch' as const,
          opacity: 75,
          customData: CODEX_CUSTOM('terrain', 'forest'),
        },
      ];
    case 'rock':
      return [
        {
          type: 'diamond' as const,
          x: x - half,
          y: y - half,
          width: size,
          height: size,
          backgroundColor: '#a8a29e',
          strokeColor: '#44403c',
          fillStyle: 'solid' as const,
          opacity: 90,
          customData: CODEX_CUSTOM('terrain', 'rock'),
        },
      ];
    case 'house':
      return [
        {
          type: 'rectangle' as const,
          x: x - half,
          y: y - half * 0.4,
          width: size,
          height: size * 0.55,
          backgroundColor: '#fef3c7',
          strokeColor: '#78350f',
          fillStyle: 'solid' as const,
          customData: CODEX_CUSTOM('structure', 'house'),
        },
        {
          type: 'line' as const,
          x: x - half,
          y: y - half * 0.4,
          width: size,
          height: size * 0.45,
          strokeColor: '#78350f',
          customData: CODEX_CUSTOM('structure', 'house-roof'),
        },
      ];
    case 'tower':
      return [
        {
          type: 'rectangle' as const,
          x: x - size * 0.2,
          y: y - half,
          width: size * 0.4,
          height: size,
          backgroundColor: '#e7e5e4',
          strokeColor: '#292524',
          fillStyle: 'solid' as const,
          customData: CODEX_CUSTOM('structure', 'tower'),
        },
      ];
    case 'bridge':
      return [
        {
          type: 'rectangle' as const,
          x: x - size,
          y: y - size * 0.15,
          width: size * 2,
          height: size * 0.3,
          backgroundColor: '#d6d3d1',
          strokeColor: '#57534e',
          fillStyle: 'solid' as const,
          customData: CODEX_CUSTOM('structure', 'bridge'),
        },
      ];
    case 'ruins':
      return [
        {
          type: 'rectangle' as const,
          x: x - half,
          y: y - half * 0.35,
          width: size * 0.45,
          height: size * 0.7,
          backgroundColor: '#a8a29e',
          strokeColor: '#44403c',
          fillStyle: 'cross-hatch' as const,
          customData: CODEX_CUSTOM('structure', 'ruins'),
        },
        {
          type: 'rectangle' as const,
          x: x + size * 0.05,
          y: y - half * 0.2,
          width: size * 0.35,
          height: size * 0.55,
          backgroundColor: '#a8a29e',
          strokeColor: '#44403c',
          fillStyle: 'cross-hatch' as const,
          customData: CODEX_CUSTOM('structure', 'ruins'),
        },
      ];
    case 'camp':
      return [
        {
          type: 'ellipse' as const,
          x: x - half,
          y: y - half * 0.35,
          width: size,
          height: size * 0.7,
          backgroundColor: '#fdba74',
          strokeColor: '#9a3412',
          fillStyle: 'solid' as const,
          customData: CODEX_CUSTOM('structure', 'camp'),
        },
        {
          type: 'text' as const,
          x: x - 18,
          y: y - 8,
          text: '⛺',
          fontSize: 24,
          customData: CODEX_CUSTOM('structure', 'camp'),
        },
      ];
    default:
      return [
        {
          type: 'rectangle' as const,
          x: x - 20,
          y: y - 20,
          width: 40,
          height: 40,
          backgroundColor: '#c4b5fd',
          strokeColor: '#5b21b6',
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
];

export async function createCodexSymbolElements(
  symbolId: string,
  sceneX: number,
  sceneY: number,
): Promise<ExcalidrawElement[]> {
  const { convertToExcalidrawElements } = await import('@excalidraw/excalidraw');
  const skeleton = skeletonForSymbol(symbolId, sceneX, sceneY);
  return convertToExcalidrawElements(skeleton, { regenerateIds: true });
}

export function getCodexSymbol(id: string): CodexMapSymbol | undefined {
  return CODEX_MAP_SYMBOLS.find((symbol) => symbol.id === id);
}
