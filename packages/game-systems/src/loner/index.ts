import { createId } from '../create-id';
import { createSheetFromDefinition } from '../types';
import {
  lonerDicePresets,
  lonerRulesPrimer,
  lonerSheetDefinition,
  lonerSoloEngine,
} from './definition';



export { lonerSheetDefinition, lonerSoloEngine } from './definition';
export {
  lonerTwistSubjects,
  lonerTwistActions,
  lonerTwistTable,
  lonerSceneMoodTable,
  lonerScenePrompts,
  lonerRulesPrimer,
  lonerDicePresets,
} from './oracle-core';
export {
  getLonerLuck,
  setLonerLuck,
  applyTakeHarmToLuck,
  rechargeLonerLuck,
  LONER_LUCK_MAX,
  LONER_LUCK_KEY,
} from './luck';

export const lonerPlugin = {
  id: 'loner' as const,
  name: 'Loner',
  tagline: 'Tags and a Chance/Risk Oracle — minimal solo stories.',
  sheetDefinition: lonerSheetDefinition,
  soloEngine: lonerSoloEngine,
  rulesPrimer: lonerRulesPrimer,
  dicePresets: lonerDicePresets,
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
