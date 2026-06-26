export const TYOV_MEMORY_KEYS = [
  'memory_1',
  'memory_2',
  'memory_3',
  'memory_4',
  'memory_5',
] as const;

export const TYOV_SKILL_KEYS = ['skill_1', 'skill_2', 'skill_3', 'skill_4', 'skill_5'] as const;

export const TYOV_RESOURCE_KEYS = [
  'resource_1',
  'resource_2',
  'resource_3',
  'resource_4',
  'resource_5',
] as const;

export const TYOV_CHARACTER_KEYS = [
  'character_1',
  'character_2',
  'character_3',
  'character_4',
  'character_5',
] as const;

export type TyovSlotKind = 'memory' | 'skill' | 'resource' | 'character';

export const TYOV_SLOT_KEYS: Record<TyovSlotKind, readonly string[]> = {
  memory: TYOV_MEMORY_KEYS,
  skill: TYOV_SKILL_KEYS,
  resource: TYOV_RESOURCE_KEYS,
  character: TYOV_CHARACTER_KEYS,
};
