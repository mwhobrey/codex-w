import { createId } from '../create-id';
import { createSheetFromDefinition } from '../types';
import { genericSheetDefinition, genericSoloEngine } from './definition';

export { genericSheetDefinition, genericSoloEngine } from './definition';

export const genericPlugin = {
  id: 'generic' as const,
  name: 'Generic',
  tagline: 'System-neutral sheets and oracle play for any table.',
  sheetDefinition: genericSheetDefinition,
  soloEngine: genericSoloEngine,
  rulesPrimer: [
    'Ask the Oracle for yes/no questions when you\'re not sure what happens next — pick how likely a "yes" is, then roll.',
    'Risk & twist is for tense moments: roll the risk dice, and on certain results pull a twist to complicate the scene.',
    'Every roll and answer is added to the session log automatically, so you can scroll back through the story later.',
  ],
  dicePresets: [
    { label: 'Oracle', notation: '1d6' },
    { label: 'Risk', notation: '2d6' },
    { label: 'Check', notation: 'd20' },
  ],
  createEmptySheet(name: string, ownerId: string) {
    const now = new Date().toISOString();
    return createSheetFromDefinition(genericSheetDefinition, {
      id: createId(),
      name,
      gameSystemId: 'generic',
      ownerId,
      originSystemId: 'generic',
      createdAt: now,
      updatedAt: now,
    });
  },
};
