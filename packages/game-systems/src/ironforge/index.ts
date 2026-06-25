import { createSheetFromDefinition } from '../types';
import { ironforgeSheetDefinition, ironforgeSoloEngine } from './definition';

function createId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `sheet-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export { ironforgeSheetDefinition, ironforgeSoloEngine } from './definition';

export const ironforgePlugin = {
  id: 'ironforge' as const,
  name: 'Ironforge',
  tagline: 'Grim industrial solo survival — swear an oath, beat the forge, fill the progress track.',
  sheetDefinition: ironforgeSheetDefinition,
  soloEngine: ironforgeSoloEngine,
  createEmptySheet(name: string, ownerId: string) {
    const now = new Date().toISOString();
    return createSheetFromDefinition(ironforgeSheetDefinition, {
      id: createId(),
      name,
      gameSystemId: 'ironforge',
      ownerId,
      originSystemId: 'ironforge',
      createdAt: now,
      updatedAt: now,
    });
  },
};
