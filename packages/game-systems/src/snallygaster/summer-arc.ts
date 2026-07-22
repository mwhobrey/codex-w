import type { OracleTableEntry } from '../types';

/** Solo PATH days 1–5 — early days stay lighter when biasing table rolls. */
export function biasCampDie(rawDie: number, maxRoll: number, campDay: number): number {
  const clampedDay = Math.max(1, Math.min(5, campDay));
  const intensity = clampedDay <= 1 ? 0.55 : clampedDay <= 3 ? 0.78 : 1;
  const biased = Math.ceil(rawDie * intensity);
  return Math.max(1, Math.min(maxRoll, biased));
}

export function lookupCampTable(
  table: OracleTableEntry[],
  rawDie: number,
  campDay: number,
): { die: number; entry: string } {
  const max = table.reduce((highest, row) => Math.max(highest, row.roll), 0);
  const die = biasCampDie(rawDie, max, campDay);
  const row = table.find((item) => item.roll === die) ?? table[0]!;
  return { die, entry: row.text };
}

export function campDayArcLabel(campDay: number): string {
  if (campDay <= 1) return 'Day 1 — settle in; one mundane problem';
  if (campDay === 2) return 'Day 2 — 1 mundane + 1 monstrous';
  if (campDay === 3) return 'Day 3 — 1 mundane + 2 monstrous';
  if (campDay === 4) return 'Day 4 — 1 mundane + 3 monstrous';
  return 'Day 5 — finale; 1 mundane + 4 monstrous';
}

/** @deprecated use campDayArcLabel */
export function campWeekArcLabel(campWeek: number): string {
  return campDayArcLabel(Math.min(5, Math.max(1, campWeek)));
}

/** How many monstrous problems the PATH day calls for. */
export function monstrousProblemsForDay(campDay: number): number {
  const day = Math.max(1, Math.min(5, campDay));
  if (day <= 1) return 0;
  return day - 1;
}
