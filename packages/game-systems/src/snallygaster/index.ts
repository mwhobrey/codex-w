import { createSheetFromDefinition } from '../types';
import { snallygasterSheetDefinition, snallygasterSoloEngine } from './definition';

function createId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `sheet-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export { snallygasterSheetDefinition, snallygasterSoloEngine } from './definition';

export const snallygasterPlugin = {
  id: 'snallygaster' as const,
  name: 'Camp Snallygaster',
  tagline: 'Summer camp horror solo — counselor and monster, problems in the pines.',
  sheetDefinition: snallygasterSheetDefinition,
  soloEngine: snallygasterSoloEngine,
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
