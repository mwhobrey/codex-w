import type { SoloEngineKind } from './types';

export type TablePanelId =
  | 'system'
  | 'loner'
  | 'totv'
  | 'snallygaster'
  | 'ironsworn'
  | 'muscadines';

const PANEL_BY_KIND: Record<SoloEngineKind, TablePanelId> = {
  oracle: 'system',
  'loner-oracle': 'loner',
  'prompt-journal': 'totv',
  'lasers-feelings': 'snallygaster',
  ironsworn: 'ironsworn',
  mentor: 'muscadines',
};

export function resolveTablePanelId(kind: SoloEngineKind | undefined): TablePanelId | null {
  if (!kind) return null;
  return PANEL_BY_KIND[kind] ?? null;
}

export function supportsTablePlayPanel(kind: SoloEngineKind | undefined): boolean {
  return resolveTablePanelId(kind) !== null;
}
