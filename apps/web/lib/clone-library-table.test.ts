import { describe, expect, it } from 'vitest';
import type { LibraryEntry } from '@codex/game-systems';
import { cloneLibraryEntryToUserTable, shouldBlankProseOnClone } from './clone-library-table';

const sampleJournal: LibraryEntry = {
  id: 'totv-journal',
  systemId: 'totv',
  systemName: 'TYOV',
  category: 'prompt-journal',
  title: 'Prompt journal',
  rows: [
    { roll: 1, label: 'loss', text: 'Copyrighted prompt text' },
    { roll: 2, label: 'gain', text: 'Another prompt' },
  ],
};

const sampleOracle: LibraryEntry = {
  id: 'loner-oracle-likelihoods',
  systemId: 'loner',
  systemName: 'Loner',
  category: 'oracle-likelihood',
  title: 'Oracle likelihoods',
  rows: [{ label: 'unlikely', text: 'Threshold 4' }],
};

describe('cloneLibraryEntryToUserTable', () => {
  it('blanks prose for prompt journals', () => {
    expect(shouldBlankProseOnClone('prompt-journal')).toBe(true);
    const table = cloneLibraryEntryToUserTable(sampleJournal, 'owner-1');
    expect(table.rows.every((row) => row.text === 'Add from your book…')).toBe(true);
    expect(table.rows[0]?.roll).toBe(1);
    expect(table.rows[0]?.label).toBe('loss');
    expect(table.sourceTemplateId).toBe('totv-journal');
  });

  it('keeps mechanical oracle text', () => {
    expect(shouldBlankProseOnClone('oracle-likelihood')).toBe(false);
    const table = cloneLibraryEntryToUserTable(sampleOracle, 'owner-1');
    expect(table.rows[0]?.text).toBe('Threshold 4');
  });
});
