import { createId } from '../create-id';
import { createSheetFromDefinition } from '../types';
import { totvSheetDefinition, totvSoloEngine } from './definition';



export { totvSheetDefinition, totvSoloEngine } from './definition';
export { totvPrompts } from './prompts';
export { getTyovCapacity, type TyovCapacity, EXPERIENCES_PER_MEMORY, MAX_EXPERIENCES } from './capacity';
export { TYOV_SLOT_KEYS, TYOV_MARK_KEYS, type TyovSlotKind } from './slots';
export {
  buildTyovPromptGuidance,
  seedTyovSlotFromPrompt,
  clearTyovSlot,
  appendDiaryFromPrompt,
  diaryPreviewLine,
  type TyovPromptGuidance,
} from './tag-engine';
export {
  parseExperiences,
  formatExperiences,
  appendExperience,
  compressMemory,
  forgetOldestExperience,
  forgetExperience,
  clearMemory,
  totalExperienceCount,
  firstMemoryWithRoom,
} from './experiences';

export const totvPlugin = {
  id: 'totv' as const,
  name: 'Thousand Year Old Vampire',
  tagline: 'Journaling solo RPG — memories fade, prompts endure, centuries unfold.',
  sheetDefinition: totvSheetDefinition,
  soloEngine: totvSoloEngine,
  rulesPrimer: [
    'Advance rolls d10 minus d6 to move through the prompt list — forward on a positive result, backward on a negative one.',
    'Each Memory holds up to three Experiences (one per line). When full, Forget or Compress before adding more.',
    'Marks are lasting changes the centuries leave on you — five slots, gained or lost like other sheet entries.',
    'Take prompt logs the current prompt and applies sheet guidance (Experience, slot, diary stanza, or Mark).',
    'Decline skips a prompt without writing — useful when it does not fit your story yet.',
    'Codex ships an original prompt journal inspired by TYOV’s structure. Use Tim Hutchings’ published book for his official prompts.',
    'Use Table info → Safety notes for Lines, Veils, and X-card reminders.',
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
