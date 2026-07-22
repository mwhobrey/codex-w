import { createSheetFromDefinition } from '../types';
import { snallygasterSheetDefinition, snallygasterSoloEngine } from './definition';

function createId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `sheet-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export { snallygasterSheetDefinition, snallygasterSoloEngine } from './definition';
export {
  biasCampDie,
  lookupCampTable,
  campDayArcLabel,
  campWeekArcLabel,
  monstrousProblemsForDay,
} from './summer-arc';
export {
  resolveSnallygasterNumber,
  skillFromStyleSpecialty,
  driftSkillAfterFailure,
  backpackFromChargen,
} from './number';
export {
  styleOptions,
  specialtyOptions,
  motivationOptions,
  mischiefTable,
  monstrousTable,
  locationTable,
  monsterTable,
  campLeaderTable,
  monsterMotiveTable,
  activityTable,
  decisionOracleTable,
  mentorPrompts,
  placeholderProblemTable,
  placeholderActivityTable,
  placeholderTwistTable,
} from './tables';

export const snallygasterPlugin = {
  id: 'snallygaster' as const,
  name: 'Camp Snallygaster',
  tagline: 'Summer camp horror — Skill, Counselor & Monster, PATH over five days.',
  sheetDefinition: snallygasterSheetDefinition,
  soloEngine: snallygasterSoloEngine,
  rulesPrimer: [
    'PATH each day: Pick a location → Approach problems → Take action → Huddle at the fire.',
    'Skill is Style + Specialty (2–5). Counselor = roll over; Monster = roll under. Exact = Monstrous Counselor.',
    'Dice pool: 1d6 +1 if using an item +1 if Style/Specialty/Motivation applies (max 3d6).',
    'Failed rolls drift Skill toward the opposite mode (min 2 / max 5).',
    'Solo: Day 1 mundane only; Days 2–5 add escalating monstrous problems. Use Oracle & Mentor when stuck.',
    'Table info → Safety notes for X-card, Lines, and Veils (this is a horror game).',
  ],
  dicePresets: [
    { label: 'Action (1d6)', notation: '1d6' },
    { label: 'With item (2d6)', notation: '2d6' },
    { label: 'Full pool (3d6)', notation: '3d6' },
    { label: 'Mundane', notation: '1d40' },
    { label: 'Monstrous', notation: '1d20' },
    { label: 'Oracle', notation: '1d6' },
  ],
  createEmptySheet(name: string, ownerId: string) {
    const now = new Date().toISOString();
    return createSheetFromDefinition(snallygasterSheetDefinition, {
      id: createId(),
      name,
      gameSystemId: 'snallygaster',
      ownerId,
      originSystemId: 'snallygaster',
      createdAt: now,
      updatedAt: now,
    });
  },
};
