import { createId } from '../create-id';
import { createSheetFromDefinition } from '../types';
import { muscadinesSheetDefinition, muscadinesSoloEngine } from './definition';



export { muscadinesSheetDefinition, muscadinesSoloEngine } from './definition';
export {
  muscadinesBackgrounds,
  getMuscadinesBackground,
  backgroundNameOptions,
  type MuscadinesBackground,
  type MuscadinesAbility,
} from './backgrounds';
export {
  folkOptions,
  guildOptions,
  styleOptions,
  quirkOptions,
  startingItemOptions,
  mentorPrompts,
  styleTable,
  quirkTable,
  startingItemTable,
  MUSCADINES_ATTRIBUTES,
  MUSCADINES_ATTRIBUTE_LABELS,
  MUSCADINES_DIE_RATINGS,
  type MuscadinesAttribute,
  type MuscadinesDieRating,
  type StyleOption,
  type QuirkOption,
} from './tables';
export {
  resolveMuscadinesCheck,
  applyBackgroundToSheet,
  adjustEndurance,
  getAttributeDie,
  getEndurance,
  parseDieRating,
  dieSides,
  defaultChallengeState,
  isMuscadinesAttribute,
  type MuscadinesChallengeState,
  type MuscadinesCheckInput,
  type MuscadinesCheckResult,
} from './challenge';

export const muscadinesPlugin = {
  id: 'muscadines' as const,
  name: 'Midnight Muscadines',
  tagline: 'Cozy-dark Marmateers — jars, challenges, mentor prompts, and Wildernight harvests.',
  sheetDefinition: muscadinesSheetDefinition,
  soloEngine: muscadinesSoloEngine,
  rulesPrimer: [
    'Play as a Marmateer: gather midnight muscadines, craft jam spells, tend Nimm’s light, and venture into the Wildernight.',
    'Checks (lite aid): roll Attribute die + Impact dice vs Difficulty Rating (DR). Meet or beat DR for a success toward Resolve (RS).',
    'Setbacks grant cards. Burn cards to add Impact d6s. Festival challenges may raise DR after each Setback.',
    'Mentor prompts stand in for GM moves (raise stakes, mystery, rival…). Oracle answers yes/no when stuck.',
    'Full card suits, feats, XP, and ingredient magic: use a licensed copy of Midnight Muscadines (SRD forthcoming).',
    'Attribution: based on Midnight Muscadines by Pandion Games (CC BY-SA 4.0). No logos or book art in Codex.',
  ],
  dicePresets: [
    { label: 'Attribute d4', notation: '1d4' },
    { label: 'Attribute d6', notation: '1d6' },
    { label: 'Attribute d8', notation: '1d8' },
    { label: 'Attribute d10', notation: '1d10' },
    { label: 'Impact (1d6)', notation: '1d6' },
    { label: 'Impact (2d6)', notation: '2d6' },
    { label: 'Protection d6', notation: '1d6' },
    { label: 'Oracle', notation: '1d6' },
  ],
  createEmptySheet(name: string, ownerId: string) {
    const now = new Date().toISOString();
    return createSheetFromDefinition(muscadinesSheetDefinition, {
      id: createId(),
      name,
      gameSystemId: 'muscadines',
      ownerId,
      originSystemId: 'muscadines',
      createdAt: now,
      updatedAt: now,
    });
  },
};
