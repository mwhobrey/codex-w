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

export const totvPlugin = {
  id: 'totv' as const,
  name: 'Thousand Year Old Vampire',
  tagline: 'Journaling solo RPG — memories fade, prompts endure, centuries unfold.',
  sheetDefinition: totvSheetDefinition,
  soloEngine: totvSoloEngine,
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
