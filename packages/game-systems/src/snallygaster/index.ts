import { createSheetFromDefinition } from '../types';
import { snallygasterSheetDefinition, snallygasterSoloEngine } from './definition';

function createId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `sheet-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export { snallygasterSheetDefinition, snallygasterSoloEngine } from './definition';
export { biasCampDie, lookupCampTable, campWeekArcLabel } from './summer-arc';

export const snallygasterPlugin = {
  id: 'snallygaster' as const,
  name: 'Camp Snallygaster',
  tagline: 'Summer camp horror solo — counselor and monster, problems in the pines.',
  sheetDefinition: snallygasterSheetDefinition,
  soloEngine: snallygasterSoloEngine,
  rulesPrimer: [
    'Switch between Counselor and Monster mode depending on whose turn it is to act, then roll 3d6.',
    'Counselor succeeds when any die rolls higher than your stat; Monster succeeds when any die rolls lower.',
    'Problem and Activity pull prompts scaled to the current summer week — advance the week as the story moves on.',
    'Twist complicates whatever just happened, pulled independently of a roll.',
  ],
  dicePresets: [
    { label: 'Counselor', notation: '3d6' },
    { label: 'Monster', notation: '3d6' },
    { label: 'Problem', notation: '1d12' },
  ],
  createEmptySheet(name: string, ownerId: string) {
    const now = new Date().toISOString();
    return createSheetFromDefinition(snallygasterSheetDefinition, {
      id: createId(),
      name,
      gameSystemId: 'snallygaster',
      ownerId,
      originSystemId: 'snallygaster',
      createdAt: now,
      updatedAt: now,
    });
  },
};
