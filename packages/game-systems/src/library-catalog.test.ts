import { describe, expect, it } from 'vitest';
import { listLibraryEntries } from './library-catalog';

describe('listLibraryEntries', () => {
  it('includes core solo systems', () => {
    const systems = new Set(listLibraryEntries().map((entry) => entry.systemId));
    expect(systems.has('loner')).toBe(true);
    expect(systems.has('totv')).toBe(true);
    expect(systems.has('snallygaster')).toBe(true);
    expect(systems.has('ironsworn')).toBe(true);
    expect(systems.has('muscadines')).toBe(true);
  });
});
