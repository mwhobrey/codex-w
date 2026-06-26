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

export interface CodexCustomData {
  codexKind?: CodexMapKind;
  codexType?: string;
  codexGroupId?: string;
  codexSceneId?: string;
  characterId?: string;
  characterName?: string;
  displayLabel?: string;
}

function codexCustom(
  kind: CodexMapKind,
  type: string,
  stampGroupId: string,
  extra?: Partial<CodexCustomData>,
  sceneGroupId?: string,
): CodexCustomData {
  return {
    codexKind: kind,
    codexType: type,
    codexGroupId: stampGroupId,
    ...(sceneGroupId ? { codexSceneId: sceneGroupId } : {}),
    ...extra,
  };
}

function buildExcalidrawGroupIds(stampGroupId: string, sceneGroupId?: string): string[] {
  if (sceneGroupId) return [sceneGroupId];
  return [stampGroupId];
}

function rebuildCodexGroupIds(
  data: CodexCustomData | undefined,
  fallback?: readonly string[],
): string[] {
  if (!data) return fallback ? [...fallback] : [];
  if (data.codexSceneId) return [data.codexSceneId];
  if (data.codexGroupId) return [data.codexGroupId];
  return fallback ? [...fallback] : [];
}

export interface CreateCodexSymbolOptions {
  token?: CodexTokenOptions;
  sceneGroupId?: string;
}

function resolveCreateOptions(
  options?: CodexTokenOptions | CreateCodexSymbolOptions,
): CreateCodexSymbolOptions {
  if (!options) return {};
  if ('sceneGroupId' in options || 'token' in options) {
    return options as CreateCodexSymbolOptions;
  }
  return { token: options as CodexTokenOptions };
}

export function createCodexSceneGroupId(): string {
  return crypto.randomUUID();
}

function windingPathPoints(
  width: number,
  height: number,
  waves = 2,
  amplitude = 0.38,
): [number, number][] {
  const alongHorizontal = width >= height;
  const steps = 16;
  const points: [number, number][] = [];
  for (let index = 0; index <= steps; index += 1) {
    const t = index / steps;
    if (alongHorizontal) {
      points.push([
        t * width,
        height / 2 + Math.sin(t * Math.PI * waves) * height * amplitude,
      ]);
    } else {
      points.push([
        width / 2 + Math.sin(t * Math.PI * waves) * width * amplitude,
        t * height,
      ]);
    }
  }
  return points;
}

function pathLineSkeleton(
  bounds: SceneBounds,
  groupIds: string[],
  stampGroupId: string,
  type: string,
  kind: CodexMapKind,
  points: [number, number][],
  strokeColor: string,
  strokeWidth: number,
  sceneGroupId?: string,
) {
  const absolute = points.map(
    ([px, py]) => [bounds.x + px, bounds.y + py] as [number, number],
  );
  let minX = absolute[0]![0]!;
  let maxX = absolute[0]![0]!;
  let minY = absolute[0]![1]!;
  let maxY = absolute[0]![1]!;
  for (const [ax, ay] of absolute) {
    minX = Math.min(minX, ax);
    maxX = Math.max(maxX, ax);
    minY = Math.min(minY, ay);
    maxY = Math.max(maxY, ay);
  }
  const width = Math.max(maxX - minX, 1);
  const height = Math.max(maxY - minY, 1);
  const relative = absolute.map(([ax, ay]) => [ax - minX, ay - minY] as [number, number]);
  return {
    type: 'line' as const,
    x: minX,
    y: minY,
    width,
    height,
    points: relative,
    strokeColor,
    strokeWidth,
    roundness: { type: 2 as const },
    groupIds,
    customData: codexCustom(kind, type, stampGroupId, undefined, sceneGroupId),
  };
}

export interface CodexTokenOptions {
  label?: string;
  characterId?: string;
  characterName?: string;
}

function readCodexData(element: ExcalidrawElement): CodexCustomData | undefined {
  return element.customData as CodexCustomData | undefined;
}

type RepairableElement = {
  id: string;
  type: ExcalidrawElement['type'];
  x: number;
  y: number;
  width: number;
  height: number;
  groupIds?: string[];
  customData?: CodexCustomData;
  text?: string | null;
  fontSize?: number;
  [key: string]: unknown;
};

interface SceneShapeBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MutableTextPlacement {
  x: number;
  y: number;
  fontSize?: number;
  text?: string | null;
}

function centerTextOnShape(text: MutableTextPlacement, shape: SceneShapeBounds): void {
  const fontSize = text.fontSize ?? 16;
  const label = text.text ?? '';
  const approxWidth = label.length * fontSize * 0.55;
  text.x = shape.x + shape.width / 2 - approxWidth / 2;
  text.y = shape.y + shape.height / 2 - fontSize / 2;
}

function tokenSkeleton(
  bounds: SceneBounds,
  groupId: string,
  type: string,
  fill: string,
  stroke: string,
  letter: string,
  sceneGroupId?: string,
  tokenOptions?: CodexTokenOptions,
) {
  const groupIds = buildExcalidrawGroupIds(groupId, sceneGroupId);
  const displayLabel = tokenOptions?.label ?? tokenOptions?.characterName ?? letter;
  const shortLabel =
    displayLabel.length <= 10 ? displayLabel : displayLabel.slice(0, 9) + '…';
  const fontSize = Math.max(12, Math.min(bounds.width, bounds.height) * 0.22);

  const ellipse = {
    type: 'ellipse' as const,
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    backgroundColor: fill,
    strokeColor: stroke,
    fillStyle: 'solid' as const,
    strokeWidth: 2,
    groupIds,
    customData: codexCustom('token', type, groupId, {
      characterId: tokenOptions?.characterId,
      characterName: tokenOptions?.characterName,
      displayLabel,
    }, sceneGroupId),
  };

  const text = {
    type: 'text' as const,
    x: bounds.x,
    y: bounds.y,
    text: shortLabel,
    fontSize,
    groupIds,
    customData: codexCustom('token', `${type}-label`, groupId, { displayLabel }, sceneGroupId),
  };

  centerTextOnShape(text, ellipse);
  return [ellipse, text];
}

function skeletonForSymbol(
  symbolId: string,
  bounds: SceneBounds,
  groupId: string,
  sceneGroupId?: string,
  tokenOptions?: CodexTokenOptions,
) {
  const groupIds = buildExcalidrawGroupIds(groupId, sceneGroupId);
  const { x, y, width, height } = bounds;
  const cx = x + width / 2;
  const cy = y + height / 2;

  switch (symbolId) {
    case 'token-player':
      return tokenSkeleton(bounds, groupId, 'player', '#93c5fd', '#1d4ed8', 'P', sceneGroupId, tokenOptions);
    case 'token-npc':
      return tokenSkeleton(bounds, groupId, 'npc', '#fca5a5', '#b91c1c', 'N', sceneGroupId, tokenOptions);
    case 'token-monster':
      return tokenSkeleton(bounds, groupId, 'monster', '#d8b4fe', '#7e22ce', 'M', sceneGroupId, tokenOptions);
    case 'token-ally':
      return tokenSkeleton(bounds, groupId, 'ally', '#86efac', '#15803d', 'A', sceneGroupId, tokenOptions);
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
          customData: codexCustom('terrain', 'grass', groupId, undefined, sceneGroupId),
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
          customData: codexCustom('terrain', 'water', groupId, undefined, sceneGroupId),
        },
      ];
    case 'river': {
      const waves = width >= height ? 2.5 : 1.5;
      const points = windingPathPoints(width, height, waves, 0.42);
      const stroke = Math.max(10, Math.min(width, height) * 0.35);
      return [
        pathLineSkeleton(bounds, groupIds, groupId, 'river', 'terrain', points, '#38bdf8', stroke, sceneGroupId),
        pathLineSkeleton(bounds, groupIds, groupId, 'river-edge', 'terrain', points, '#0369a1', 2, sceneGroupId),
      ];
    }
    case 'road': {
      const points = windingPathPoints(width, height, 1.2, 0.12);
      const stroke = Math.max(6, Math.min(width, height) * 0.22);
      return [
        pathLineSkeleton(bounds, groupIds, groupId, 'road', 'terrain', points, '#a8a29e', stroke, sceneGroupId),
        pathLineSkeleton(bounds, groupIds, groupId, 'road-edge', 'terrain', points, '#57534e', 1, sceneGroupId),
      ];
    }
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
          customData: codexCustom('terrain', 'sand', groupId, undefined, sceneGroupId),
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
          customData: codexCustom('terrain', 'forest', groupId, undefined, sceneGroupId),
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
          customData: codexCustom('terrain', 'rock', groupId, undefined, sceneGroupId),
        },
      ];
    case 'house': {
      const body = {
        type: 'rectangle' as const,
        x,
        y: y + height * 0.35,
        width,
        height: height * 0.65,
        backgroundColor: '#fef3c7',
        strokeColor: '#78350f',
        fillStyle: 'solid' as const,
        groupIds,
        customData: codexCustom('structure', 'house', groupId, undefined, sceneGroupId),
      };
      const roof = {
        type: 'line' as const,
        x,
        y: y + height * 0.35,
        width,
        height: height * 0.4,
        strokeColor: '#78350f',
        groupIds,
        customData: codexCustom('structure', 'house-roof', groupId, undefined, sceneGroupId),
      };
      return [body, roof];
    }
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
          customData: codexCustom('structure', 'tower', groupId, undefined, sceneGroupId),
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
          customData: codexCustom('structure', 'bridge', groupId, undefined, sceneGroupId),
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
          customData: codexCustom('structure', 'ruins', groupId, undefined, sceneGroupId),
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
          customData: codexCustom('structure', 'ruins', groupId, undefined, sceneGroupId),
        },
      ];
    case 'camp': {
      const base = {
        type: 'ellipse' as const,
        x,
        y: y + height * 0.1,
        width,
        height: height * 0.9,
        backgroundColor: '#fdba74',
        strokeColor: '#9a3412',
        fillStyle: 'solid' as const,
        groupIds,
        customData: codexCustom('structure', 'camp', groupId, undefined, sceneGroupId),
      };
      const icon = {
        type: 'text' as const,
        x: cx - 12,
        y: cy - 10,
        text: '⛺',
        fontSize: Math.max(16, Math.min(width, height) * 0.35),
        groupIds,
        customData: codexCustom('structure', 'camp-icon', groupId, undefined, sceneGroupId),
      };
      centerTextOnShape(icon, base);
      return [base, icon];
    }
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
          customData: codexCustom('terrain', 'unknown', groupId, undefined, sceneGroupId),
        },
      ];
  }
}

export const CODEX_MAP_SYMBOLS: CodexMapSymbol[] = [
  { id: 'grass', label: 'Grass', kind: 'terrain', category: 'Ground', hint: 'Open field' },
  { id: 'water', label: 'Water', kind: 'terrain', category: 'Ground', hint: 'Pond or lake' },
  { id: 'river', label: 'River', kind: 'terrain', category: 'Ground', hint: 'Winding water — drag along the flow' },
  { id: 'road', label: 'Road', kind: 'terrain', category: 'Ground', hint: 'Path or track' },
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

/** Re-bind codex stamp groups and re-center token labels after Yjs reload or Excalidraw label edits. */
export function repairCodexSceneElements(elements: readonly ExcalidrawElement[]): ExcalidrawElement[] {
  if (!elements.length) return [];

  const next = elements.map((element) => ({ ...element })) as unknown as RepairableElement[];
  const byGroup = new Map<string, RepairableElement[]>();

  for (const element of next) {
    const data = readCodexData(element as unknown as ExcalidrawElement);
    const groupId = data?.codexGroupId;
    if (!groupId) continue;
    const bucket = byGroup.get(groupId) ?? [];
    bucket.push(element);
    byGroup.set(groupId, bucket);
  }

  for (const [groupId, members] of byGroup) {
    for (const member of members) {
      const data = readCodexData(member as unknown as ExcalidrawElement);
      member.groupIds = rebuildCodexGroupIds(data, member.groupIds);
      if (data) {
        member.customData = {
          ...data,
          codexGroupId: data.codexGroupId ?? groupId,
        };
      }
    }

    const tokenEllipse = members.find(
      (member) =>
        member.type === 'ellipse' && readCodexData(member as unknown as ExcalidrawElement)?.codexKind === 'token',
    );
    if (tokenEllipse) {
      const labels = members.filter((member) => member.type === 'text');
      const label =
        labels.find((member) =>
          readCodexData(member as unknown as ExcalidrawElement)?.codexType?.endsWith('-label'),
        ) ?? labels[0];
      if (label && label.type === 'text') {
        const data = readCodexData(tokenEllipse as unknown as ExcalidrawElement);
        if (data?.displayLabel && !label.text?.includes('…')) {
          label.text =
            data.displayLabel.length <= 10
              ? data.displayLabel
              : `${data.displayLabel.slice(0, 9)}…`;
        }
        centerTextOnShape(label, tokenEllipse);
      }
    }

    const campBase = members.find(
      (member) =>
        member.type === 'ellipse' && readCodexData(member as unknown as ExcalidrawElement)?.codexType === 'camp',
    );
    const campIcon = members.find(
      (member) =>
        member.type === 'text' && readCodexData(member as unknown as ExcalidrawElement)?.codexType === 'camp-icon',
    );
    if (campBase && campIcon && campIcon.type === 'text') {
      centerTextOnShape(campIcon, campBase);
    }
  }

  // Legacy tokens: ellipse used embedded label — reattach bound/container text
  for (const element of next) {
    if (element.type !== 'ellipse') continue;
    const data = readCodexData(element as unknown as ExcalidrawElement);
    if (data?.codexKind !== 'token') continue;

    const bound = next.find(
      (candidate) =>
        candidate.type === 'text' &&
        'containerId' in candidate &&
        (candidate as { containerId?: string | null }).containerId === element.id,
    );
    if (bound && bound.type === 'text') {
      const groupId = data.codexGroupId ?? element.groupIds?.[0] ?? crypto.randomUUID();
      const sceneId = data.codexSceneId;
      element.groupIds = buildExcalidrawGroupIds(groupId, sceneId);
      bound.groupIds = buildExcalidrawGroupIds(groupId, sceneId);
      element.customData = { ...data, codexGroupId: groupId };
      bound.customData = codexCustom('token', `${data.codexType ?? 'token'}-label`, groupId, {
        displayLabel: data.displayLabel,
      }, sceneId);
      centerTextOnShape(bound, element);
    }
  }

  return next as unknown as ExcalidrawElement[];
}

export function selectionHasCodexGroup(
  elements: readonly ExcalidrawElement[],
  selectedIds: readonly string[],
): boolean {
  if (!selectedIds.length) return false;
  return selectedIds.some((id) => {
    const element = elements.find((item) => item.id === id);
    if (!element) return false;
    const data = element.customData as CodexCustomData | undefined;
    return Boolean(data?.codexSceneId || data?.codexGroupId);
  });
}

/** Split scene or stamp groups for the current selection (scene first, then stamp). */
export function breakApartCodexElements(
  elements: readonly ExcalidrawElement[],
  selectedIds: readonly string[],
): ExcalidrawElement[] {
  if (!selectedIds.length) return [...elements];

  const next = elements.map((element) => ({ ...element })) as unknown as RepairableElement[];

  let sceneId: string | undefined;
  for (const id of selectedIds) {
    const element = next.find((item) => item.id === id);
    const data = element?.customData as CodexCustomData | undefined;
    if (data?.codexSceneId) {
      sceneId = data.codexSceneId;
      break;
    }
  }

  if (sceneId) {
    for (const element of next) {
      const data = element.customData as CodexCustomData | undefined;
      if (data?.codexSceneId !== sceneId) continue;
      const stampGroup = data.codexGroupId;
      element.groupIds = stampGroup ? [stampGroup] : [];
      element.customData = { ...data, codexSceneId: undefined };
    }
    return next as unknown as ExcalidrawElement[];
  }

  for (const id of selectedIds) {
    const element = next.find((item) => item.id === id);
    if (!element) continue;
    const data = element.customData as CodexCustomData | undefined;
    if (!data?.codexGroupId) continue;
    const sceneGroup = data.codexSceneId;
    element.groupIds = sceneGroup ? [sceneGroup] : [];
    element.customData = { ...data, codexGroupId: undefined };
  }

  return next as unknown as ExcalidrawElement[];
}

export async function createCodexSymbolElements(
  symbolId: string,
  bounds: SceneBounds,
  options?: CodexTokenOptions | CreateCodexSymbolOptions,
): Promise<ExcalidrawElement[]> {
  const { convertToExcalidrawElements } = await import('@excalidraw/excalidraw');
  const resolved = resolveCreateOptions(options);
  const groupId = crypto.randomUUID();
  const skeleton = skeletonForSymbol(
    symbolId,
    bounds,
    groupId,
    resolved.sceneGroupId,
    resolved.token,
  );
  return convertToExcalidrawElements(skeleton, { regenerateIds: true });
}

export function getCodexSymbol(id: string): CodexMapSymbol | undefined {
  return CODEX_MAP_SYMBOLS.find((symbol) => symbol.id === id);
}

export function isFogTool(tool: CodexMapTool): boolean {
  return tool === 'fog-hide' || tool === 'fog-reveal';
}
