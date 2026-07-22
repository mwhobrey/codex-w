export type OracleAnswer = 'yes' | 'no';

export type OracleModifier = 'and' | 'but' | 'none';

/** Full Loner Oracle label, e.g. "Yes, and..." */
export type ChanceRiskOracleLabel =
  | 'Yes, and...'
  | 'Yes'
  | 'Yes, but...'
  | 'No, but...'
  | 'No'
  | 'No, and...';

export interface YesNoOracleResult {
  roll: number;
  threshold: number;
  answer: OracleAnswer;
}

export interface RiskRollResult {
  dice: [number, number];
  sum: number;
  isTwist: boolean;
}

export interface TableLookupResult {
  roll: number;
  entry: string;
}

export interface ChanceRiskOracleResult {
  chance: number;
  risk: number;
  answer: OracleAnswer;
  modifier: OracleModifier;
  isDouble: boolean;
  /** Base label before Twist Counter override on doubles */
  label: ChanceRiskOracleLabel;
}

export interface TwistCounterResult {
  /** Counter after this roll (0 after a triggered twist) */
  counter: number;
  twistTriggered: boolean;
  /**
   * When doubles occur and no twist triggers, SRD forces "Yes, but...".
   * When a twist triggers, null — caller should run the twist table instead.
   */
  overrideLabel: ChanceRiskOracleLabel | null;
}

export type HarmDirection = 'cause' | 'take';

export interface HarmLuckResult {
  label: ChanceRiskOracleLabel;
  direction: HarmDirection;
  amount: number;
}

const D6_MIN = 1;
const D6_MAX = 6;
export const LONER_TWIST_COUNTER_THRESHOLD = 3;
export const LONER_LUCK_MAX = 6;

function clampD6(value: number): number {
  return Math.max(D6_MIN, Math.min(D6_MAX, Math.round(value)));
}

/** Mythic / generic yes/no: answer is yes when roll <= threshold */
export function resolveYesNoOracle(roll: number, threshold: number): YesNoOracleResult {
  const clampedRoll = clampD6(roll);
  const clampedThreshold = clampD6(threshold);
  return {
    roll: clampedRoll,
    threshold: clampedThreshold,
    answer: clampedRoll <= clampedThreshold ? 'yes' : 'no',
  };
}

export function resolveRiskRoll(dieA: number, dieB: number): RiskRollResult {
  const a = clampD6(dieA);
  const b = clampD6(dieB);
  return {
    dice: [a, b],
    sum: a + b,
    isTwist: a === b,
  };
}

/**
 * Keep the highest die from a pool (advantage/disadvantage extras).
 * Empty pool falls back to 1.
 */
export function keepHighestDie(dice: number[]): number {
  if (dice.length === 0) return D6_MIN;
  return Math.max(...dice.map(clampD6));
}

/**
 * Loner Chance vs Risk Oracle (CC BY-SA SRD).
 * Equal dice → Yes, and... (Twist Counter handled separately).
 */
export function resolveChanceRiskOracle(chance: number, risk: number): ChanceRiskOracleResult {
  const c = clampD6(chance);
  const r = clampD6(risk);
  const isDouble = c === r;

  if (isDouble) {
    return {
      chance: c,
      risk: r,
      answer: 'yes',
      modifier: 'and',
      isDouble: true,
      label: 'Yes, and...',
    };
  }

  const answer: OracleAnswer = c > r ? 'yes' : 'no';
  const bothLow = c < 4 && r < 4;
  const bothHigh = c > 3 && r > 3;
  let modifier: OracleModifier = 'none';
  if (bothLow) modifier = 'but';
  else if (bothHigh) modifier = 'and';

  const label = formatChanceRiskLabel(answer, modifier);
  return { chance: c, risk: r, answer, modifier, isDouble: false, label };
}

export function formatChanceRiskLabel(
  answer: OracleAnswer,
  modifier: OracleModifier,
): ChanceRiskOracleLabel {
  if (modifier === 'and') return answer === 'yes' ? 'Yes, and...' : 'No, and...';
  if (modifier === 'but') return answer === 'yes' ? 'Yes, but...' : 'No, but...';
  return answer === 'yes' ? 'Yes' : 'No';
}

/**
 * Advance the Loner Twist Counter after an Oracle roll.
 * On doubles: increment; if counter reaches threshold, trigger twist and reset.
 * While counter stays below threshold after a double, answer becomes "Yes, but...".
 */
export function advanceTwistCounter(
  currentCounter: number,
  isDouble: boolean,
  threshold = LONER_TWIST_COUNTER_THRESHOLD,
): TwistCounterResult {
  const safe = Math.max(0, Math.round(currentCounter));
  if (!isDouble) {
    return { counter: safe, twistTriggered: false, overrideLabel: null };
  }

  const next = safe + 1;
  if (next >= threshold) {
    return { counter: 0, twistTriggered: true, overrideLabel: null };
  }
  return { counter: next, twistTriggered: false, overrideLabel: 'Yes, but...' };
}

/** Final Oracle label after applying Twist Counter rules for doubles. */
export function finalizeChanceRiskLabel(
  base: ChanceRiskOracleResult,
  twist: TwistCounterResult,
): ChanceRiskOracleLabel | 'Twist' {
  if (twist.twistTriggered) return 'Twist';
  if (twist.overrideLabel) return twist.overrideLabel;
  return base.label;
}

/** Harm & Luck damage from an Oracle conflict answer (SRD). */
export function resolveHarmFromOracle(label: ChanceRiskOracleLabel): HarmLuckResult {
  switch (label) {
    case 'Yes, and...':
      return { label, direction: 'cause', amount: 3 };
    case 'Yes':
      return { label, direction: 'cause', amount: 2 };
    case 'Yes, but...':
      return { label, direction: 'cause', amount: 1 };
    case 'No, but...':
      return { label, direction: 'take', amount: 1 };
    case 'No':
      return { label, direction: 'take', amount: 2 };
    case 'No, and...':
      return { label, direction: 'take', amount: 3 };
  }
}

export function clampLuck(value: number, max = LONER_LUCK_MAX): number {
  return Math.max(0, Math.min(max, Math.round(value)));
}

export function applyHarmToLuck(
  currentLuck: number,
  harm: HarmLuckResult,
  /** When true, "cause" harms the opponent (no change to self); "take" harms self */
  asProtagonist = true,
  max = LONER_LUCK_MAX,
): number {
  if (asProtagonist) {
    if (harm.direction === 'take') return clampLuck(currentLuck - harm.amount, max);
    return clampLuck(currentLuck, max);
  }
  if (harm.direction === 'cause') return clampLuck(currentLuck - harm.amount, max);
  return clampLuck(currentLuck, max);
}

export function lookupTable<T extends { roll: number; text: string }>(
  table: T[],
  roll: number,
): TableLookupResult {
  const maxRoll = table.reduce((max, row) => Math.max(max, row.roll), 6);
  const clampedRoll = Math.max(1, Math.min(maxRoll, Math.round(roll)));
  const entry = table.find((row) => row.roll === clampedRoll);
  return {
    roll: clampedRoll,
    entry: entry?.text ?? 'No result for this roll.',
  };
}

export function tableMaxRoll<T extends { roll: number; text: string }>(table: T[]): number {
  return table.reduce((max, row) => Math.max(max, row.roll), 6);
}
