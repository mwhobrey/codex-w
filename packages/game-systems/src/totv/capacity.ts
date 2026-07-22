import type { CharacterSheet } from '@codex/schemas';
import { getSheetFieldValue } from '../field-access';
import {
  EXPERIENCES_PER_MEMORY,
  MAX_EXPERIENCES,
  experienceCountInMemory,
  totalExperienceCount,
} from './experiences';
import {
  TYOV_CHARACTER_KEYS,
  TYOV_MARK_KEYS,
  TYOV_MEMORY_KEYS,
  TYOV_RESOURCE_KEYS,
  TYOV_SKILL_KEYS,
} from './slots';

function countFilled(sheet: CharacterSheet, keys: readonly string[]): number {
  return keys.filter((key) => Boolean(getSheetFieldValue(sheet, key))).length;
}

export interface TyovCapacity {
  memories: { filled: number; max: number };
  experiences: { filled: number; max: number };
  skills: { filled: number; max: number };
  resources: { filled: number; max: number };
  characters: { filled: number; max: number };
  marks: { filled: number; max: number };
}

export function getTyovCapacity(sheet: CharacterSheet | null): TyovCapacity | null {
  if (!sheet || sheet.gameSystemId !== 'totv') return null;
  return {
    memories: {
      filled: TYOV_MEMORY_KEYS.filter((key) => experienceCountInMemory(sheet, key) > 0).length,
      max: TYOV_MEMORY_KEYS.length,
    },
    experiences: {
      filled: totalExperienceCount(sheet),
      max: MAX_EXPERIENCES,
    },
    skills: { filled: countFilled(sheet, TYOV_SKILL_KEYS), max: TYOV_SKILL_KEYS.length },
    resources: { filled: countFilled(sheet, TYOV_RESOURCE_KEYS), max: TYOV_RESOURCE_KEYS.length },
    characters: {
      filled: countFilled(sheet, TYOV_CHARACTER_KEYS),
      max: TYOV_CHARACTER_KEYS.length,
    },
    marks: { filled: countFilled(sheet, TYOV_MARK_KEYS), max: TYOV_MARK_KEYS.length },
  };
}

export { EXPERIENCES_PER_MEMORY, MAX_EXPERIENCES };
