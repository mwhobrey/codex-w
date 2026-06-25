import { createSheetFromDefinition } from '../types';
import { genericSheetDefinition, genericSoloEngine } from './definition';

function createId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `sheet-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export { genericSheetDefinition, genericSoloEngine } from './definition';

export const genericPlugin = {
  id: 'generic' as const,
  name: 'Generic',
  tagline: 'System-neutral sheets and oracle play for any table.',
  sheetDefinition: genericSheetDefinition,
  soloEngine: genericSoloEngine,
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
