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
