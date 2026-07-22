/**
 * Shared Loner Chance/Risk oracle tables (CC BY-SA SRD).
 * See ./NOTICE
 */

import type { OracleTableEntry } from '../types';

/** Twist subjects — roll 1d6 (SRD). */
export const lonerTwistSubjects: OracleTableEntry[] = [
  { roll: 1, text: 'A third party' },
  { roll: 2, text: 'The hero' },
  { roll: 3, text: 'An encounter' },
  { roll: 4, text: 'A physical event' },
  { roll: 5, text: 'An emotional event' },
  { roll: 6, text: 'An object' },
];

/** Twist actions — roll 1d6 (SRD). */
export const lonerTwistActions: OracleTableEntry[] = [
  { roll: 1, text: 'Appears' },
  { roll: 2, text: 'Alters the location' },
  { roll: 3, text: 'Helps the hero' },
  { roll: 4, text: 'Hinders the hero' },
  { roll: 5, text: 'Changes the goal' },
  { roll: 6, text: 'Ends the scene' },
];

/**
 * Combined twist rows for library catalog (subject · action pairs are rolled
 * separately in play; this list is a readable reference of both columns).
 */
export const lonerTwistTable: OracleTableEntry[] = lonerTwistSubjects.map((subject, i) => {
  const action = lonerTwistActions[i]!;
  return {
    roll: subject.roll,
    text: `${subject.text} / ${action.text}`,
  };
});

export const lonerSceneMoodTable: OracleTableEntry[] = [
  { roll: 1, text: 'Dramatic scene — carry tension forward with new obstacles' },
  { roll: 2, text: 'Dramatic scene — carry tension forward with new obstacles' },
  { roll: 3, text: 'Dramatic scene — carry tension forward with new obstacles' },
  { roll: 4, text: 'Quiet scene — breathe, heal, plan, deepen relationships' },
  { roll: 5, text: 'Quiet scene — breathe, heal, plan, deepen relationships' },
  { roll: 6, text: 'Meanwhile… — cut to villains or other plot-important characters' },
];

export const lonerScenePrompts = [
  'What is your character trying to do in this scene?',
  'Which tags grant Advantage or Disadvantage right now?',
  'What do you expect the world to do — and what closed question tests that?',
  'How does your Goal or Motive push this moment forward?',
  'Where might your Nemesis (or Frailty) complicate things?',
];

export const lonerRulesPrimer = [
  'Ask a closed yes/no question. Roll one Chance die and one Risk die (add a die of the same color for Advantage or Disadvantage; keep the higher of that color).',
  'Higher Chance = Yes; higher Risk = No. Both low (≤3) add “but…”; both high (≥4) add “and…”. Doubles advance the Twist Counter.',
  'When the Twist Counter hits 3, roll subject + action on the Twist table and reset the counter. Conflicts can spend Luck via Harm (cause/take 1–3).',
];

export const lonerDicePresets = [
  { label: 'Chance', notation: '1d6' },
  { label: 'Risk', notation: '1d6' },
  { label: 'Oracle', notation: '2d6' },
  { label: 'Twist', notation: '2d6' },
];
