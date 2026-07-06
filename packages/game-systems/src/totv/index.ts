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
  rulesPrimer: [
    'Advance rolls d10 minus d6 to move through the prompt list — forward on a positive result, backward on a negative one.',
    'Take prompt logs the current prompt to the session log and, if it grants or costs a Memory or Skill, opens your sheet so you can record it.',
    'Decline skips a prompt without writing about it, still moving the navigation forward — useful when a prompt doesn\'t fit your story yet.',
    'The Oracle below works the same as other systems: ask a yes/no question about the scene and pick how likely a "yes" is.',
  ],
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
