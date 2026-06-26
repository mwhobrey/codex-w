import { createSheetFromDefinition } from '../types';
import { muscadinesSheetDefinition, muscadinesSoloEngine } from './definition';

function createId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `sheet-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export { muscadinesSheetDefinition, muscadinesSoloEngine } from './definition';

export const muscadinesPlugin = {
  id: 'muscadines' as const,
  name: 'Midnight Muscadines',
  tagline: 'Cozy-dark folklore solo — mentor prompts, oracles, and magical jams.',
  sheetDefinition: muscadinesSheetDefinition,
  soloEngine: muscadinesSoloEngine,
  dicePresets: [
    { label: 'Oracle', notation: '1d6' },
    { label: 'Grove omen', notation: '1d6' },
    { label: 'Jar', notation: '1d8' },
  ],
  createEmptySheet(name: string, ownerId: string) {
    const now = new Date().toISOString();
    return createSheetFromDefinition(muscadinesSheetDefinition, {
      id: createId(),
      name,
      gameSystemId: 'muscadines',
      ownerId,
      originSystemId: 'muscadines',
      createdAt: now,
      updatedAt: now,
    });
  },
};
