import { createSheetFromDefinition } from '../types';
import { totvSheetDefinition, totvSoloEngine } from './definition';

function createId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `sheet-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export { totvSheetDefinition, totvSoloEngine } from './definition';
export { totvPrompts } from './prompts';
export { getTyovCapacity, type TyovCapacity } from './capacity';
export { TYOV_SLOT_KEYS } from './slots';
export {
  buildTyovPromptGuidance,
  seedTyovSlotFromPrompt,
  clearTyovSlot,
  type TyovPromptGuidance,
} from './tag-engine';

export const totvPlugin = {
  id: 'totv' as const,
  name: 'Thousand Year Old Vampire',
  tagline: 'Journaling solo RPG — memories fade, prompts endure, centuries unfold.',
  sheetDefinition: totvSheetDefinition,
  soloEngine: totvSoloEngine,
  dicePresets: [
    { label: 'Navigate', notation: 'd10-d6' },
    { label: 'Mood', notation: '1d6' },
  ],
  createEmptySheet(name: string, ownerId: string) {
    const now = new Date().toISOString();
    return createSheetFromDefinition(totvSheetDefinition, {
      id: createId(),
      name,
      gameSystemId: 'totv',
      ownerId,
      originSystemId: 'totv',
      createdAt: now,
      updatedAt: now,
    });
  },
};
