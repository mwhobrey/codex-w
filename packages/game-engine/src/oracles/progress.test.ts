import { describe, expect, it } from 'vitest';
import type { Rng } from '../rng';
import {
  applyBurnMomentum,
  markProgressTicks,
  progressScoreFromTicks,
  resolveActionRoll,
  resolveProgressRoll,
} from './progress';

function seq(...values: number[]): Rng {
  let i = 0;
  return () => values[i++] ?? 0;
}

describe('resolveActionRoll', () => {
  it('scores a strong hit when action beats both challenge dice', () => {
    // d6=6 (0.99), d10=1 (0), d10=2 (0.1)
    const rng = seq(0.99, 0, 0.1);
    const result = resolveActionRoll({ stat: 3, adds: 0, rng });
    expect(result.actionDie).toBe(6);
    expect(result.actionScore).toBe(9);
    expect(result.challengeDice).toEqual([1, 2]);
    expect(result.outcome).toBe('strong');
    expect(result.match).toBe(false);
  });

  it('scores a weak hit when action beats only one challenge die', () => {
    const rng = seq(0.5, 0.9, 0); // d6=4, d10=10, d10=1 → score 4+2=6 beats 1 only
    const result = resolveActionRoll({ stat: 2, adds: 0, rng });
    expect(result.outcome).toBe('weak');
  });

  it('flags a match when challenge dice are equal', () => {
    const rng = seq(0, 0.4, 0.4); // d6=1, d10=5, d10=5
    const result = resolveActionRoll({ stat: 1, rng });
    expect(result.match).toBe(true);
  });

  it('cancels the action die when negative momentum matches', () => {
    const rng = seq(0.5, 0, 0); // d6=4, challenges 1,1
    const result = resolveActionRoll({ stat: 2, momentum: -4, rng });
    expect(result.actionDieCancelled).toBe(true);
    expect(result.actionScore).toBe(2);
  });
});

describe('applyBurnMomentum', () => {
  it('cancels challenge dice under current momentum', () => {
    const roll = resolveActionRoll({
      stat: 1,
      adds: 0,
      rng: seq(0, 0.8, 0.2), // action 1 → score 2 vs 9, 3
    });
    expect(roll.outcome).toBe('miss');
    const burned = applyBurnMomentum(roll, 5);
    // 9 is not < 5; 3 is < 5 → one hit = weak
    expect(burned.outcome).toBe('weak');
  });
});

describe('resolveProgressRoll', () => {
  it('uses progress score against challenge dice', () => {
    const result = resolveProgressRoll(6, seq(0.2, 0.8)); // 3, 9
    expect(result.outcome).toBe('weak');
  });
});

describe('vow progress ticks', () => {
  it('marks boxes by rank', () => {
    expect(markProgressTicks(0, 'troublesome')).toBe(12);
    expect(progressScoreFromTicks(12)).toBe(3);
    expect(markProgressTicks(0, 'epic')).toBe(1);
    expect(progressScoreFromTicks(1)).toBe(0);
  });
});
