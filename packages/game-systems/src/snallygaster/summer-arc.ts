import type { OracleTableEntry } from '../types';

/** Bias camp table rolls — early summer stays lighter, late summer escalates. */
export function biasCampDie(rawDie: number, maxRoll: number, campWeek: number): number {
  const clampedWeek = Math.max(1, Math.min(8, campWeek));
  const intensity = clampedWeek <= 2 ? 0.55 : clampedWeek <= 5 ? 0.78 : 1;
  const biased = Math.ceil(rawDie * intensity);
  return Math.max(1, Math.min(maxRoll, biased));
}

export function lookupCampTable(
  table: OracleTableEntry[],
  rawDie: number,
  campWeek: number,
): { die: number; entry: string } {
  const max = table.reduce((highest, row) => Math.max(highest, row.roll), 0);
  const die = biasCampDie(rawDie, max, campWeek);
  const row = table.find((item) => item.roll === die) ?? table[0]!;
  return { die, entry: row.text };
}

export function campWeekArcLabel(campWeek: number): string {
  if (campWeek <= 2) return 'Opening week — problems stay manageable';
  if (campWeek <= 5) return 'Mid-summer — stakes rise';
  return 'Final stretch — nothing stays small';
}
