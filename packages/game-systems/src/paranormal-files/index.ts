import { createId } from '../create-id';
import { createSheetFromDefinition } from '../types';
import {
  paranormalFilesDicePresets,
  paranormalFilesRulesPrimer,
  paranormalFilesSheetDefinition,
  paranormalFilesSoloEngine,
} from './definition';



export {
  paranormalFilesSheetDefinition,
  paranormalFilesSoloEngine,
} from './definition';
export {
  applyUnknownThreshold,
  flattenD66,
  pfConceptGrid,
  pfFrailtyGrid,
  pfGearGrid,
  pfSkillGrid,
  pfFactions,
  realityFractureTable,
  rollD66Entry,
  thresholdDeltaForLabel,
  UNKNOWN_THRESHOLD_MAX,
  unknownThresholdDeltas,
} from './tables';

export const paranormalFilesPlugin = {
  id: 'paranormal-files' as const,
  name: 'Loner: Paranormal Files',
  tagline: 'Agents, anomalies, and redacted truths — Chance/Risk Oracle.',
  sheetDefinition: paranormalFilesSheetDefinition,
  soloEngine: paranormalFilesSoloEngine,
  rulesPrimer: paranormalFilesRulesPrimer,
  dicePresets: paranormalFilesDicePresets,
  createEmptySheet(name: string, ownerId: string) {
    const now = new Date().toISOString();
    return createSheetFromDefinition(paranormalFilesSheetDefinition, {
      id: createId(),
      name,
      gameSystemId: 'paranormal-files',
      ownerId,
      originSystemId: 'paranormal-files',
      createdAt: now,
      updatedAt: now,
    });
  },
};
