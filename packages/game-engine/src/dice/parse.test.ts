import { describe, expect, it } from 'vitest';
import { DiceParseError, parseDiceNotation } from './parse';

describe('parseDiceNotation', () => {
  it('parses bare d20', () => {
    const result = parseDiceNotation('d20');
    expect(result.terms).toEqual([{ type: 'dice', count: 1, sides: 20 }]);
  });

  it('parses count and modifier', () => {
    const result = parseDiceNotation('2d6+3');
    expect(result.terms).toHaveLength(2);
    expect(result.terms[0]).toEqual({ type: 'dice', count: 2, sides: 6 });
    expect(result.terms[1]).toEqual({ type: 'modifier', value: 3 });
  });

  it('parses keep highest', () => {
    const result = parseDiceNotation('4d6kh3');
    expect(result.terms[0]).toEqual({
      type: 'dice',
      count: 4,
      sides: 6,
      keepDrop: { kind: 'kh', count: 3 },
    });
  });

  it('parses advantage shorthand', () => {
    const result = parseDiceNotation('d20adv');
    expect(result.terms[0]).toEqual({
      type: 'dice',
      count: 2,
      sides: 20,
      keepDrop: { kind: 'kh', count: 1 },
    });
  });

  it('parses disadvantage shorthand', () => {
    const result = parseDiceNotation('1d20dis');
    expect(result.terms[0]).toEqual({
      type: 'dice',
      count: 2,
      sides: 20,
      keepDrop: { kind: 'kl', count: 1 },
    });
  });

  it('parses percentile dice', () => {
    const result = parseDiceNotation('d%');
    expect(result.terms[0]).toEqual({ type: 'dice', count: 1, sides: 'percent' });
  });

  it('parses fudge dice', () => {
    const result = parseDiceNotation('4dF');
    expect(result.terms[0]).toEqual({ type: 'dice', count: 4, sides: 'fudge' });
  });

  it('rejects empty notation', () => {
    expect(() => parseDiceNotation('')).toThrow(DiceParseError);
  });

  it('rejects invalid terms', () => {
    expect(() => parseDiceNotation('abc')).toThrow(DiceParseError);
  });
});
