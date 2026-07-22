import type { CharacterSheet } from '@codex/schemas';
import { getSheetFieldValue, setSheetFieldValue } from '../field-access';
import { specialtyOptions, styleOptions } from './tables';

type SkillMode = 'counselor' | 'monster';


const DEFAULT_SKILL = 3;

function clampSkill(value: number): number {
  return Math.max(2, Math.min(5, Math.round(value)));
}

function readOptionalNumber(sheet: CharacterSheet, key: string): number | undefined {
  const raw = getSheetFieldValue(sheet, key);
  if (raw === '') return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Resolve Skill (Lasers & Feelings Number) from a sheet.
 * Prefers `number`; falls back to Style+Specialty mods, then legacy dual stats.
 */
export function resolveSnallygasterNumber(
  sheet: CharacterSheet | null | undefined,
): number {
  if (!sheet) return DEFAULT_SKILL;

  const primary = readOptionalNumber(sheet, 'number');
  if (primary !== undefined) return clampSkill(primary);

  const fromChargen = skillFromStyleSpecialty(sheet);
  if (fromChargen !== undefined) return fromChargen;

  const counselor = readOptionalNumber(sheet, 'counselor_stat');
  const monster = readOptionalNumber(sheet, 'monster_stat');
  if (counselor !== undefined && monster !== undefined) {
    return clampSkill((counselor + monster) / 2);
  }
  if (counselor !== undefined) return clampSkill(counselor);
  if (monster !== undefined) return clampSkill(monster);

  return DEFAULT_SKILL;
}

export function skillFromStyleSpecialty(sheet: CharacterSheet): number | undefined {
  const style = getSheetFieldValue(sheet, 'style');
  const specialty = getSheetFieldValue(sheet, 'specialty');
  const styleMod = styleOptions.find((s) => s.style === style)?.skill;
  const specMod = specialtyOptions.find((s) => s.specialty === specialty)?.skill;
  if (styleMod === undefined || specMod === undefined) return undefined;
  return clampSkill(styleMod + specMod);
}

/** On failed roll: Monster → Skill −1 (min 2); Counselor → Skill +1 (max 5). */
export function driftSkillAfterFailure(
  sheet: CharacterSheet,
  mode: SkillMode,
): CharacterSheet {
  const current = resolveSnallygasterNumber(sheet);
  const next =
    mode === 'monster' ? Math.max(2, current - 1) : Math.min(5, current + 1);
  return setSheetFieldValue(sheet, 'number', next);
}

/** Suggested backpack string from Style + Specialty selections. */
export function backpackFromChargen(sheet: CharacterSheet): string {
  const style = getSheetFieldValue(sheet, 'style');
  const specialty = getSheetFieldValue(sheet, 'specialty');
  const styleItem = styleOptions.find((s) => s.style === style)?.item;
  const specItems = specialtyOptions.find((s) => s.specialty === specialty)?.items;
  return [styleItem, specItems].filter(Boolean).join('; ');
}
