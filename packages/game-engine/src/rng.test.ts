import { describe, it, expect } from 'vitest';
import { defaultRng, rollInt } from './rng';

describe('rng', () => {
  it('defaultRng returns numbers in [0, 1)', () => {
    for (let i = 0; i < 1000; i++) {
      const val = defaultRng();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it('rollInt returns integers within the bounds', () => {
    const min = 1;
    const max = 6;
    const results = new Set<number>();
    
    for (let i = 0; i < 1000; i++) {
      const rolled = rollInt(min, max);
      expect(rolled).toBeGreaterThanOrEqual(min);
      expect(rolled).toBeLessThanOrEqual(max);
      expect(Number.isInteger(rolled)).toBe(true);
      results.add(rolled);
    }
    
    // With 1000 rolls on d6, we should cover all numbers 1 to 6.
    expect(results.size).toBe(6);
    for (let i = min; i <= max; i++) {
      expect(results.has(i)).toBe(true);
    }
  });
});
