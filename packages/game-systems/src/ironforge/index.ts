import { createSheetFromDefinition } from '../types';
import { ironforgeSheetDefinition, ironforgeSoloEngine } from './definition';

function createId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `sheet-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export { ironforgeSheetDefinition, ironforgeSoloEngine } from './definition';
export { bumpIronforgeHeat, getIronforgeHeat, IRONFORGE_HEAT_MAX } from './heat';

export const ironforgePlugin = {
  id: 'ironforge' as const,
  name: 'Ironforge',
  tagline: 'Grim industrial solo survival — swear an oath, beat the forge, fill the progress track.',
  sheetDefinition: ironforgeSheetDefinition,
  soloEngine: ironforgeSoloEngine,
  dicePresets: [
    { label: 'Forge', notation: '2d6' },
    { label: 'Hazard', notation: '1d6' },
  ],
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
