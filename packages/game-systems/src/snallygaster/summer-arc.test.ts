import { describe, expect, it } from 'vitest';
import { biasCampDie, campWeekArcLabel, lookupCampTable } from './summer-arc';

const table = [
  { roll: 1, text: 'mild' },
  { roll: 2, text: 'medium' },
  { roll: 3, text: 'severe' },
  { roll: 4, text: 'catastrophic' },
];

describe('snallygaster summer arc', () => {
  it('keeps early-week rolls lighter', () => {
    expect(biasCampDie(4, 4, 1)).toBeLessThan(biasCampDie(4, 4, 8));
  });

  it('labels arc phases', () => {
    expect(campWeekArcLabel(1)).toContain('Opening');
    expect(campWeekArcLabel(8)).toContain('Final');
  });

  it('looks up biased table entries', () => {
    const early = lookupCampTable(table, 4, 1);
    const late = lookupCampTable(table, 4, 8);
    expect(early.die).toBeLessThanOrEqual(late.die);
  });
});
