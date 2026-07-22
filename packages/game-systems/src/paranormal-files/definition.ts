import { lonerSheetDefinition } from '../loner/definition';
import {
  lonerDicePresets,
  lonerRulesPrimer,
  lonerSceneMoodTable,
  lonerScenePrompts,
  lonerTwistActions,
  lonerTwistSubjects,
  lonerTwistTable,
} from '../loner/oracle-core';
import type { SheetDefinition } from '../types';
import {
  pfFactions,
  realityFractureTable,
  UNKNOWN_THRESHOLD_MAX,
  unknownThresholdDeltas,
} from './tables';

/** Same tag sheet as vanilla Loner; notes double as case file. */
export const paranormalFilesSheetDefinition: SheetDefinition = {
  sections: lonerSheetDefinition.sections.map((section) => {
    if (section.id !== 'notes') return section;
    return {
      ...section,
      title: 'Case File',
      fields: section.fields.map((field) =>
        field.key === 'notes'
          ? {
              ...field,
              label: 'Case notes',
              placeholder: 'Redacted reports, conditions, faction ties, threads…',
            }
          : field,
      ),
    };
  }),
};

export const paranormalFilesRulesPrimer = [
  ...lonerRulesPrimer,
  'Unknown Threshold starts at 0 each investigation. After witnessing, interacting with, or failing to contain an anomaly, apply the Oracle result’s threshold change. At 6, roll the Reality Fracture table.',
  'Use Cover-up, Faction, and Corruption guides to interpret Oracle answers when operating in the shadows.',
];

export const paranormalFilesSoloEngine = {
  kind: 'loner-oracle' as const,
  oracleDice: '1d6',
  riskDice: '1d6',
  scenePrompts: [
    ...lonerScenePrompts,
    'What anomaly, cover story, or faction pressure shapes this scene?',
  ],
  twistTable: lonerTwistTable,
  twistSubjects: lonerTwistSubjects,
  twistActions: lonerTwistActions,
  sceneMoodTable: lonerSceneMoodTable,
  paranormalFiles: {
    unknownThresholdMax: UNKNOWN_THRESHOLD_MAX,
    thresholdDeltas: unknownThresholdDeltas,
    realityFractureTable,
    factions: pfFactions,
  },
};

export const paranormalFilesDicePresets = lonerDicePresets;
