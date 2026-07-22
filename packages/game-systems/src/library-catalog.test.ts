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

  it('exposes muscadines chargen tables', () => {
    const entries = listLibraryEntries().filter((e) => e.systemId === 'muscadines');
    const titles = new Set(entries.map((e) => e.title));
    expect(titles.has('Styles')).toBe(true);
    expect(titles.has('Quirks')).toBe(true);
    expect(titles.has('Starting items')).toBe(true);
    expect(titles.has('Backgrounds')).toBe(true);
    expect(titles.has('Mentor prompts')).toBe(true);
  });
});
