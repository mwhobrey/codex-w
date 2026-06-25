import { describe, expect, it } from 'vitest';
import type { Rng } from '../rng';
import { resolveForgeRoll } from './progress';

function seq(...values: number[]): Rng {
  let i = 0;
  return () => values[i++] ?? 0;
}

describe('resolveForgeRoll', () => {
  it('marks a strong hit when total beats target by 3+', () => {
    const rng = seq(0.83, 0.83); // 5, 5 + mod 2
    const result = resolveForgeRoll(2, 9, rng);
    expect(result.total).toBe(12);
    expect(result.outcome).toBe('strong');
    expect(result.progressGain).toBe(2);
  });

  it('marks a miss below target', () => {
    const rng = seq(0, 0); // 1, 1
    const result = resolveForgeRoll(0, 9, rng);
    expect(result.outcome).toBe('miss');
    expect(result.progressGain).toBe(0);
  });
});
