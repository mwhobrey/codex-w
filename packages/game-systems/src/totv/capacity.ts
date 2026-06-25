import type { CharacterSheet } from '@codex/schemas';
import { getSheetFieldValue } from '../field-access';

const MEMORY_KEYS = ['memory_1', 'memory_2', 'memory_3', 'memory_4', 'memory_5'] as const;
const SKILL_KEYS = ['skill_1', 'skill_2', 'skill_3', 'skill_4', 'skill_5'] as const;
const RESOURCE_KEYS = ['resource_1', 'resource_2', 'resource_3', 'resource_4', 'resource_5'] as const;
const CHARACTER_KEYS = ['character_1', 'character_2', 'character_3', 'character_4', 'character_5'] as const;

function countFilled(sheet: CharacterSheet, keys: readonly string[]): number {
  return keys.filter((key) => Boolean(getSheetFieldValue(sheet, key))).length;
}

export interface TyovCapacity {
  memories: { filled: number; max: number };
  skills: { filled: number; max: number };
  resources: { filled: number; max: number };
  characters: { filled: number; max: number };
}

export function getTyovCapacity(sheet: CharacterSheet | null): TyovCapacity | null {
  if (!sheet || sheet.gameSystemId !== 'totv') return null;
  return {
    memories: { filled: countFilled(sheet, MEMORY_KEYS), max: MEMORY_KEYS.length },
    skills: { filled: countFilled(sheet, SKILL_KEYS), max: SKILL_KEYS.length },
    resources: { filled: countFilled(sheet, RESOURCE_KEYS), max: RESOURCE_KEYS.length },
    characters: { filled: countFilled(sheet, CHARACTER_KEYS), max: CHARACTER_KEYS.length },
  };
}
