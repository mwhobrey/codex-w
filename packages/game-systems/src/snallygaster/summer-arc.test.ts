import { describe, expect, it } from 'vitest';
import {
  biasCampDie,
  campDayArcLabel,
  campWeekArcLabel,
  lookupCampTable,
  monstrousProblemsForDay,
} from './summer-arc';

const table = [
  { roll: 1, text: 'mild' },
  { roll: 2, text: 'medium' },
  { roll: 3, text: 'severe' },
  { roll: 4, text: 'catastrophic' },
];

describe('snallygaster summer arc', () => {
  it('keeps early-day rolls lighter', () => {
    expect(biasCampDie(4, 4, 1)).toBeLessThan(biasCampDie(4, 4, 5));
  });

  it('labels PATH day phases', () => {
    expect(campDayArcLabel(1)).toContain('Day 1');
    expect(campDayArcLabel(5)).toContain('Day 5');
    expect(campWeekArcLabel(8)).toContain('Day 5');
  });

  it('looks up biased table entries', () => {
    const early = lookupCampTable(table, 4, 1);
    const late = lookupCampTable(table, 4, 5);
    expect(early.die).toBeLessThanOrEqual(late.die);
  });

  it('escalates monstrous quota by day', () => {
    expect(monstrousProblemsForDay(1)).toBe(0);
    expect(monstrousProblemsForDay(3)).toBe(2);
    expect(monstrousProblemsForDay(5)).toBe(4);
  });
});
