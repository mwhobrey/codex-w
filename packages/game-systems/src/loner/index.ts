import { createSheetFromDefinition } from '../types';
import { lonerSheetDefinition, lonerSoloEngine } from './definition';

function createId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `sheet-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export { lonerSheetDefinition, lonerSoloEngine } from './definition';

export const lonerPlugin = {
  id: 'loner' as const,
  name: 'Loner',
  tagline: 'Solo RPG of risky questions and sharp twists.',
  sheetDefinition: lonerSheetDefinition,
  soloEngine: lonerSoloEngine,
  rulesPrimer: [
    'Ask the Oracle a yes/no question and pick a likelihood — impossible, unlikely, even, likely, or certain — before you roll.',
    'When a scene gets risky, roll Risk & twist: a bad enough result pulls a twist that complicates things further.',
    'Everything you roll or answer lands in the session log automatically, so your play history stays readable afterward.',
  ],
  dicePresets: [
    { label: 'Oracle', notation: '1d6' },
    { label: 'Risk', notation: '2d6' },
    { label: 'Twist', notation: '1d6' },
  ],
  createEmptySheet(name: string, ownerId: string) {
    const now = new Date().toISOString();
    return createSheetFromDefinition(lonerSheetDefinition, {
      id: createId(),
      name,
      gameSystemId: 'loner',
      ownerId,
      originSystemId: 'loner',
      createdAt: now,
      updatedAt: now,
    });
  },
};
