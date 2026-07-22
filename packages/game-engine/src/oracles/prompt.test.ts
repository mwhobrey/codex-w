import { describe, expect, it } from 'vitest';
import type { Rng } from '../rng';
import { advancePromptIndex, resolveLasersFeelings } from './prompt';

function seq(...values: number[]): Rng {
  let i = 0;
  return () => {
    const v = values[i++];
    if (v === undefined) throw new Error('exhausted rng sequence');
    return v;
  };
}

describe('advancePromptIndex', () => {
  it('clamps to prompt range', () => {
    const rng = seq(0.95, 0.0); // d10=10, d6=1 -> +9
    const result = advancePromptIndex(1, 1, 12, rng);
    expect(result.next).toBe(10);
    expect(result.delta).toBe(9);
  });
});

describe('resolveLasersFeelings', () => {
  it('defaults to one die', () => {
    const rng = seq(0.5); // 4 vs number 3 counselor
    const result = resolveLasersFeelings(3, 'counselor', { rng });
    expect(result.dice).toHaveLength(1);
    expect(result.successes).toBe(1);
    expect(result.outcome).toBe('mixed');
  });

  it('counselor succeeds on dice over Number', () => {
    // 4, 6, 2 vs 3 → two successes
    const rng = seq(0.5, 0.83, 0.16);
    const result = resolveLasersFeelings(3, 'counselor', { diceCount: 3, rng });
    expect(result.success).toBe(true);
    expect(result.successes).toBe(2);
    expect(result.outcome).toBe('success');
    expect(result.laserFeelings).toBe(false);
  });

  it('monster succeeds on dice under Number', () => {
    // 2, 1, 5 vs 3 → two successes
    const rng = seq(0.16, 0.0, 0.83);
    const result = resolveLasersFeelings(3, 'monster', { diceCount: 3, rng });
    expect(result.successes).toBe(2);
    expect(result.outcome).toBe('success');
  });

  it('exact match counts as success and Laser Feelings', () => {
    // 3 vs number 3
    const rng = seq(0.4); // floor(0.4*6)+1 = 3
    const result = resolveLasersFeelings(3, 'counselor', { diceCount: 1, rng });
    expect(result.dice).toEqual([3]);
    expect(result.successes).toBe(1);
    expect(result.laserFeelings).toBe(true);
    expect(result.outcome).toBe('mixed');
  });

  it('three successes is critical', () => {
    // 4, 5, 6 vs 3 counselor
    const rng = seq(0.5, 0.7, 0.9);
    const result = resolveLasersFeelings(3, 'counselor', { diceCount: 3, rng });
    expect(result.dice).toEqual([4, 5, 6]);
    expect(result.successes).toBe(3);
    expect(result.outcome).toBe('critical');
  });

  it('zero successes is fail', () => {
    // 1, 2 vs 4 counselor
    const rng = seq(0.0, 0.16);
    const result = resolveLasersFeelings(4, 'counselor', { diceCount: 2, rng });
    expect(result.successes).toBe(0);
    expect(result.outcome).toBe('fail');
    expect(result.success).toBe(false);
  });

  it('clamps diceCount to 1–3', () => {
    const rng = seq(0.5, 0.5, 0.5, 0.5);
    const result = resolveLasersFeelings(3, 'counselor', { diceCount: 9, rng });
    expect(result.dice).toHaveLength(3);
  });
});
