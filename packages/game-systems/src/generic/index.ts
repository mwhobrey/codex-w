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
