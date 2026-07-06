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
  rulesPrimer: [
    'Roll 2d6 + grit against a difficulty target — a hit fills in Oath progress, a miss pulls a complication from the table.',
    'Oath progress fills as forge rolls succeed; reach the end of the track and your vow is fulfilled.',
    'Heat rises whenever a forge roll goes badly — a full Heat track means the consequences of your failures are catching up with you.',
    'Hazard pulls a standalone danger prompt for the scene, independent of a forge roll.',
  ],
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
