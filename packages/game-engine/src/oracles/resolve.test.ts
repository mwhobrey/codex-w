import { describe, expect, it } from 'vitest';
import {
  advanceTwistCounter,
  applyHarmToLuck,
  finalizeChanceRiskLabel,
  keepHighestDie,
  lookupTable,
  resolveChanceRiskOracle,
  resolveHarmFromOracle,
  resolveRiskRoll,
  resolveYesNoOracle,
} from './resolve';

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

describe('resolveChanceRiskOracle', () => {
  it('returns Yes when Chance is higher', () => {
    const r = resolveChanceRiskOracle(5, 2);
    expect(r.answer).toBe('yes');
    expect(r.modifier).toBe('none');
    expect(r.label).toBe('Yes');
    expect(r.isDouble).toBe(false);
  });

  it('returns No when Risk is higher', () => {
    const r = resolveChanceRiskOracle(2, 5);
    expect(r.answer).toBe('no');
    expect(r.label).toBe('No');
  });

  it('adds but when both dice are low', () => {
    expect(resolveChanceRiskOracle(3, 1).label).toBe('Yes, but...');
    expect(resolveChanceRiskOracle(1, 3).label).toBe('No, but...');
  });

  it('adds and when both dice are high', () => {
    expect(resolveChanceRiskOracle(5, 4).label).toBe('Yes, and...');
    expect(resolveChanceRiskOracle(4, 5).label).toBe('No, and...');
  });

  it('treats doubles as Yes, and... with isDouble', () => {
    const r = resolveChanceRiskOracle(4, 4);
    expect(r.isDouble).toBe(true);
    expect(r.label).toBe('Yes, and...');
    expect(r.answer).toBe('yes');
  });
});

describe('keepHighestDie', () => {
  it('keeps the highest clamped d6', () => {
    expect(keepHighestDie([2, 5, 3])).toBe(5);
    expect(keepHighestDie([])).toBe(1);
  });
});

describe('advanceTwistCounter', () => {
  it('does nothing when not a double', () => {
    expect(advanceTwistCounter(2, false)).toEqual({
      counter: 2,
      twistTriggered: false,
      overrideLabel: null,
    });
  });

  it('increments and forces Yes, but... below threshold', () => {
    expect(advanceTwistCounter(0, true)).toEqual({
      counter: 1,
      twistTriggered: false,
      overrideLabel: 'Yes, but...',
    });
    expect(advanceTwistCounter(1, true)).toEqual({
      counter: 2,
      twistTriggered: false,
      overrideLabel: 'Yes, but...',
    });
  });

  it('triggers twist and resets at threshold', () => {
    expect(advanceTwistCounter(2, true)).toEqual({
      counter: 0,
      twistTriggered: true,
      overrideLabel: null,
    });
  });
});

describe('finalizeChanceRiskLabel', () => {
  it('returns Twist when counter triggers', () => {
    const base = resolveChanceRiskOracle(3, 3);
    const twist = advanceTwistCounter(2, true);
    expect(finalizeChanceRiskLabel(base, twist)).toBe('Twist');
  });

  it('applies Yes, but... override on early doubles', () => {
    const base = resolveChanceRiskOracle(3, 3);
    const twist = advanceTwistCounter(0, true);
    expect(finalizeChanceRiskLabel(base, twist)).toBe('Yes, but...');
  });
});

describe('resolveHarmFromOracle', () => {
  it('maps SRD harm amounts', () => {
    expect(resolveHarmFromOracle('Yes, and...')).toEqual({
      label: 'Yes, and...',
      direction: 'cause',
      amount: 3,
    });
    expect(resolveHarmFromOracle('Yes')).toEqual({ label: 'Yes', direction: 'cause', amount: 2 });
    expect(resolveHarmFromOracle('Yes, but...')).toEqual({
      label: 'Yes, but...',
      direction: 'cause',
      amount: 1,
    });
    expect(resolveHarmFromOracle('No, but...')).toEqual({
      label: 'No, but...',
      direction: 'take',
      amount: 1,
    });
    expect(resolveHarmFromOracle('No')).toEqual({ label: 'No', direction: 'take', amount: 2 });
    expect(resolveHarmFromOracle('No, and...')).toEqual({
      label: 'No, and...',
      direction: 'take',
      amount: 3,
    });
  });
});

describe('applyHarmToLuck', () => {
  it('reduces protagonist luck on take', () => {
    expect(applyHarmToLuck(6, resolveHarmFromOracle('No'), true)).toBe(4);
  });

  it('leaves protagonist luck unchanged on cause', () => {
    expect(applyHarmToLuck(6, resolveHarmFromOracle('Yes'), true)).toBe(6);
  });

  it('reduces opponent luck on cause', () => {
    expect(applyHarmToLuck(6, resolveHarmFromOracle('Yes, and...'), false)).toBe(3);
  });
});
