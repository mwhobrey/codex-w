import { describe, expect, it } from 'vitest';
import { listLibraryEntries } from './library-catalog';

describe('library catalog', () => {
  it('includes entries for all solo systems', () => {
    const entries = listLibraryEntries();
    const systems = new Set(entries.map((entry) => entry.systemId));
    expect(systems.has('loner')).toBe(true);
    expect(systems.has('totv')).toBe(true);
    expect(systems.has('snallygaster')).toBe(true);
    expect(systems.has('muscadines')).toBe(true);
    expect(systems.has('ironforge')).toBe(true);
  });

  it('includes TYOV prompt journal rows', () => {
    const journal = listLibraryEntries().find((entry) => entry.id === 'totv-journal');
    expect(journal?.rows.length).toBeGreaterThan(30);
  });
});
