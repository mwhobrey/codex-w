import type { CharacterSheet } from '@codex/schemas';
import { getSheetFieldValue, setSheetFieldValue } from '../field-access';

export const LONER_LUCK_KEY = 'luck';
export const LONER_LUCK_MAX = 6;

const LONER_SYSTEMS = new Set(['loner', 'paranormal-files']);

function clampLuck(value: number): number {
  return Math.max(0, Math.min(LONER_LUCK_MAX, Math.round(value)));
}

export function getLonerLuck(sheet: CharacterSheet | null): number {
  if (!sheet || !LONER_SYSTEMS.has(sheet.gameSystemId)) return LONER_LUCK_MAX;
  const raw = getSheetFieldValue(sheet, LONER_LUCK_KEY);
  const n = Number(raw);
  return Number.isFinite(n) ? clampLuck(n) : LONER_LUCK_MAX;
}

export function setLonerLuck(sheet: CharacterSheet, value: number): CharacterSheet {
  return setSheetFieldValue(sheet, LONER_LUCK_KEY, clampLuck(value));
}

export function applyTakeHarmToLuck(sheet: CharacterSheet, amount: number): CharacterSheet {
  return setLonerLuck(sheet, getLonerLuck(sheet) - amount);
}

export function rechargeLonerLuck(sheet: CharacterSheet): CharacterSheet {
  return setLonerLuck(sheet, LONER_LUCK_MAX);
}
