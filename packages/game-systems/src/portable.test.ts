import { describe, expect, it } from 'vitest';
import { genericPlugin } from './generic';
import { lonerPlugin } from './loner';
import { totvPlugin } from './totv';
import { adaptSheetToSystem, extractPortableProfile } from './portable';

describe('extractPortableProfile', () => {
  it('extracts loner identity fields', () => {
    const sheet = lonerPlugin.createEmptySheet('Kael', 'owner');
    sheet.fields = sheet.fields.map((f) => {
      if (f.key === 'goal') return { ...f, value: 'Find the archive' };
      if (f.key === 'motive') return { ...f, value: 'It holds proof of innocence' };
      if (f.key === 'nemesis') return { ...f, value: 'The Syndicate' };
      if (f.key === 'verb') return { ...f, value: 'sneak' };
      return f;
    });

    const profile = extractPortableProfile(sheet);
    expect(profile.name).toBe('Kael');
    expect(profile.tagline).toBe('Find the archive');
    expect(profile.nemesis).toBe('The Syndicate');
    expect(profile.traits.some((t) => t.includes('sneak'))).toBe(true);
  });
});

describe('adaptSheetToSystem', () => {
  it('carries loner character into generic system', () => {
    const loner = lonerPlugin.createEmptySheet('Kael', 'owner');
    loner.fields = loner.fields.map((f) =>
      f.key === 'goal' ? { ...f, value: 'Escape the city' } : f,
    );

    const adapted = adaptSheetToSystem(loner, genericPlugin.createEmptySheet, 'generic');
    expect(adapted.gameSystemId).toBe('generic');
    expect(adapted.lineageSheetId).toBe(loner.id);
    expect(adapted.originSystemId).toBe('loner');
    expect(adapted.fields.find((f) => f.key === 'concept')?.value).toBe('Escape the city');
  });

  it('carries loner character into TOTV', () => {
    const loner = lonerPlugin.createEmptySheet('Kael', 'owner');
    loner.fields = loner.fields.map((f) =>
      f.key === 'goal' ? { ...f, value: 'Steal the ledger' } : f,
    );

    const adapted = adaptSheetToSystem(loner, totvPlugin.createEmptySheet, 'totv');
    expect(adapted.gameSystemId).toBe('totv');
    expect(adapted.fields.find((f) => f.key === 'human_name')?.value).toBe('Steal the ledger');
  });
});
