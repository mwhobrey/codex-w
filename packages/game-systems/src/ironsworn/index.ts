import { createSheetFromDefinition } from '../types';
import {
  ironswornDicePresets,
  ironswornRulesPrimer,
  ironswornSheetDefinition,
  ironswornSoloEngine,
} from './definition';

function createId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `sheet-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export { ironswornSheetDefinition, ironswornSoloEngine } from './definition';
export {
  actionOracle,
  themeOracle,
  combatActionOracle,
  plotTwistOracle,
  challengeRankOracle,
  ironswornOracleCatalog,
  lookupOracleD100,
  lookupOracleRange,
  rollOracleD100,
} from './oracles';
export { ironswornCoreMoves, getIronswornMove, type IronswornMove } from './moves';
export {
  ironswornAssets,
  getIronswornAsset,
  parseAssetIds,
  type IronswornAsset,
} from './assets';
export {
  createVow,
  markVowProgress,
  readVowsFromGameState,
  readActiveVowId,
  vowsProgressScore,
  vowsFilledBoxes,
  getStatValue,
  getMeterValue,
  patchMeter,
  burnMomentumOnSheet,
  IRONSWORN_RANKS,
  IRONSWORN_STATS,
  IRONSWORN_PROGRESS_BOXES,
  type IronswornVow,
  type IronswornChallengeRank,
  type IronswornStatKey,
} from './vows';

export const ironswornPlugin = {
  id: 'ironsworn' as const,
  name: 'Ironsworn',
  tagline: 'Iron vows, action rolls, and oracles in the Ironlands.',
  sheetDefinition: ironswornSheetDefinition,
  soloEngine: ironswornSoloEngine,
  rulesPrimer: ironswornRulesPrimer,
  dicePresets: ironswornDicePresets,
  createEmptySheet(name: string, ownerId: string) {
    const now = new Date().toISOString();
    return createSheetFromDefinition(ironswornSheetDefinition, {
      id: createId(),
      name,
      gameSystemId: 'ironsworn',
      ownerId,
      originSystemId: 'ironsworn',
      createdAt: now,
      updatedAt: now,
    });
  },
};
