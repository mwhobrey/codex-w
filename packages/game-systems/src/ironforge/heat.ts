import type { CharacterSheet } from '@codex/schemas';
import { getSheetFieldValue, setSheetFieldValue } from '../field-access';

export const IRONFORGE_HEAT_MAX = 5;
export const IRONFORGE_HEAT_KEY = 'heat';

export function getIronforgeHeat(sheet: CharacterSheet | null): number {
  if (!sheet || sheet.gameSystemId !== 'ironforge') return 0;
  const raw = getSheetFieldValue(sheet, IRONFORGE_HEAT_KEY);
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

export function bumpIronforgeHeat(
  sheet: CharacterSheet,
  delta: number,
): CharacterSheet {
  const current = getIronforgeHeat(sheet);
  const next = Math.max(0, Math.min(IRONFORGE_HEAT_MAX, current + delta));
  return setSheetFieldValue(sheet, IRONFORGE_HEAT_KEY, next);
}
