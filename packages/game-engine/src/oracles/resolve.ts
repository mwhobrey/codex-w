export type OracleAnswer = 'yes' | 'no';

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

/** Loner-style yes/no: answer is yes when roll <= threshold */
export function resolveYesNoOracle(roll: number, threshold: number): YesNoOracleResult {
  const clampedRoll = Math.max(1, Math.min(6, Math.round(roll)));
  const clampedThreshold = Math.max(1, Math.min(6, Math.round(threshold)));
  return {
    roll: clampedRoll,
    threshold: clampedThreshold,
    answer: clampedRoll <= clampedThreshold ? 'yes' : 'no',
  };
}

export function resolveRiskRoll(dieA: number, dieB: number): RiskRollResult {
  const a = Math.max(1, Math.min(6, Math.round(dieA)));
  const b = Math.max(1, Math.min(6, Math.round(dieB)));
  return {
    dice: [a, b],
    sum: a + b,
    isTwist: a === b,
  };
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
