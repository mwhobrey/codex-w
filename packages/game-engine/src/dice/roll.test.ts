import { describe, expect, it } from 'vitest';
import { parseDiceNotation } from './parse';
import { rollDiceNotation, rollParsed } from './roll';
import type { Rng } from '../rng';

const sequence =
  (values: number[]): Rng =>
  () => {
    const next = values.shift();
    if (next === undefined) throw new Error('RNG sequence exhausted');
    return next;
  };

describe('rollParsed', () => {
  it('sums dice and modifiers', () => {
    const parsed = parseDiceNotation('2d6+3');
    const rng = sequence([0.0, 0.5, 0.99]); // 1, 4, 6
    const result = rollParsed(parsed, rng);
    expect(result.total).toBe(8);
    expect(result.modifierTotal).toBe(3);
  });

  it('keeps highest dice', () => {
    const parsed = parseDiceNotation('4d6kh3');
    const rng = sequence([0.1, 0.2, 0.8, 0.9]); // 1, 2, 5, 6 -> keep 2,5,6
    const result = rollParsed(parsed, rng);
    expect(result.total).toBe(13);
    const group = result.groups[0]!;
    expect(group.rolls.filter((die) => die.kept)).toHaveLength(3);
    expect(group.rolls.filter((die) => !die.kept)).toHaveLength(1);
  });

  it('rolls advantage as 2d20kh1', () => {
    const parsed = parseDiceNotation('d20adv');
    const rng = sequence([0.0, 0.99]); // 1, 20 -> keep 20
    const result = rollParsed(parsed, rng);
    expect(result.total).toBe(20);
  });

  it('exposes notation entrypoint', () => {
    const rng = sequence([0.5]);
    const result = rollDiceNotation('d20', rng);
    expect(result.notation).toBe('d20');
    expect(result.total).toBeGreaterThanOrEqual(1);
    expect(result.total).toBeLessThanOrEqual(20);
  });
});
