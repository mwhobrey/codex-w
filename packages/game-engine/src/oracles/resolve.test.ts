import { describe, expect, it } from 'vitest';
import { lookupTable, resolveRiskRoll, resolveYesNoOracle } from './resolve';

describe('resolveYesNoOracle', () => {
  it('returns yes when roll is within threshold', () => {
    expect(resolveYesNoOracle(3, 3).answer).toBe('yes');
    expect(resolveYesNoOracle(4, 3).answer).toBe('no');
  });
});

describe('resolveRiskRoll', () => {
  it('detects doubles as a twist', () => {
    expect(resolveRiskRoll(4, 4).isTwist).toBe(true);
    expect(resolveRiskRoll(3, 4).isTwist).toBe(false);
  });
});

describe('lookupTable', () => {
  it('returns matching entry text', () => {
    const table = [
      { roll: 1, text: 'Alpha' },
      { roll: 2, text: 'Beta' },
    ];
    expect(lookupTable(table, 2).entry).toBe('Beta');
  });
});
