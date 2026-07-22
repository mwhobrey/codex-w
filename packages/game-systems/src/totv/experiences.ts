import type { CharacterSheet } from '@codex/schemas';
import { clearSheetFieldValue, getSheetFieldValue, setSheetFieldValue } from '../field-access';
import { TYOV_MEMORY_KEYS } from './slots';

export const EXPERIENCES_PER_MEMORY = 3;
export const MAX_EXPERIENCES = TYOV_MEMORY_KEYS.length * EXPERIENCES_PER_MEMORY;

/** Split a memory field into Experiences (one per non-empty line), capped at 3. */
export function parseExperiences(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, EXPERIENCES_PER_MEMORY);
}

export function formatExperiences(parts: string[]): string {
  return parts
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, EXPERIENCES_PER_MEMORY)
    .join('\n');
}

export function experienceCountInMemory(sheet: CharacterSheet, memoryKey: string): number {
  return parseExperiences(getSheetFieldValue(sheet, memoryKey)).length;
}

export function totalExperienceCount(sheet: CharacterSheet): number {
  return TYOV_MEMORY_KEYS.reduce(
    (sum, key) => sum + experienceCountInMemory(sheet, key),
    0,
  );
}

/** First memory with room for another Experience, or null if all are full (3 each). */
export function firstMemoryWithRoom(sheet: CharacterSheet): string | null {
  for (const key of TYOV_MEMORY_KEYS) {
    if (experienceCountInMemory(sheet, key) < EXPERIENCES_PER_MEMORY) return key;
  }
  return null;
}

/** Last memory that has at least one Experience. */
export function lastMemoryWithExperience(sheet: CharacterSheet): string | null {
  for (let i = TYOV_MEMORY_KEYS.length - 1; i >= 0; i -= 1) {
    const key = TYOV_MEMORY_KEYS[i]!;
    if (experienceCountInMemory(sheet, key) > 0) return key;
  }
  return null;
}

export function appendExperience(
  sheet: CharacterSheet,
  memoryKey: string,
  text: string,
): CharacterSheet | null {
  const parts = parseExperiences(getSheetFieldValue(sheet, memoryKey));
  if (parts.length >= EXPERIENCES_PER_MEMORY) return null;
  const next = text.trim();
  if (!next) return sheet;
  return setSheetFieldValue(sheet, memoryKey, formatExperiences([...parts, next]));
}

/** Drop the oldest Experience (first line). */
export function forgetOldestExperience(
  sheet: CharacterSheet,
  memoryKey: string,
): CharacterSheet {
  const parts = parseExperiences(getSheetFieldValue(sheet, memoryKey));
  if (parts.length === 0) return sheet;
  return setSheetFieldValue(sheet, memoryKey, formatExperiences(parts.slice(1)));
}

export function forgetExperience(
  sheet: CharacterSheet,
  memoryKey: string,
  index: number,
): CharacterSheet {
  const parts = parseExperiences(getSheetFieldValue(sheet, memoryKey));
  if (index < 0 || index >= parts.length) return sheet;
  return setSheetFieldValue(
    sheet,
    memoryKey,
    formatExperiences(parts.filter((_, i) => i !== index)),
  );
}

/**
 * Compress a memory into a single Experience seed the player can edit.
 * Joins with "; " and truncates for sheet space.
 */
export function compressMemory(sheet: CharacterSheet, memoryKey: string): CharacterSheet {
  const parts = parseExperiences(getSheetFieldValue(sheet, memoryKey));
  if (parts.length <= 1) return sheet;
  const joined = parts.join('; ');
  const compressed =
    joined.length > 160 ? `${joined.slice(0, 157).trimEnd()}…` : joined;
  return setSheetFieldValue(sheet, memoryKey, compressed);
}

export function clearMemory(sheet: CharacterSheet, memoryKey: string): CharacterSheet {
  return clearSheetFieldValue(sheet, memoryKey);
}
