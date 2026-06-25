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
  it('counselor succeeds when any die exceeds stat', () => {
    const rng = seq(0.5, 0.83, 0.16); // 4, 6, 2 vs stat 3
    const result = resolveLasersFeelings(3, 'counselor', rng);
    expect(result.success).toBe(true);
  });
});
