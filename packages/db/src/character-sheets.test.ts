import { describe, expect, it } from 'vitest';
import { mapCharacterSheetRow } from './character-sheets';

describe('mapCharacterSheetRow', () => {
  it('maps row fields and ISO dates; omits null optionals', () => {
    const created = new Date('2026-01-02T03:04:05.000Z');
    const updated = new Date('2026-01-03T03:04:05.000Z');
    const sheet = mapCharacterSheetRow({
      id: '11111111-1111-1111-1111-111111111111',
      ownerId: 'owner-a',
      name: 'Aria',
      gameSystemId: 'loner',
      fields: [{ key: 'given_name', label: 'Name', type: 'text', value: 'Aria' }],
      originSystemId: null,
      lineageSheetId: null,
      portraitUrl: null,
      layout: null,
      createdAt: created,
      updatedAt: updated,
    });

    expect(sheet.ownerId).toBe('owner-a');
    expect(sheet.gameSystemId).toBe('loner');
    expect(sheet.originSystemId).toBeUndefined();
    expect(sheet.lineageSheetId).toBeUndefined();
    expect(sheet.portraitUrl).toBeUndefined();
    expect(sheet.createdAt).toBe(created.toISOString());
    expect(sheet.updatedAt).toBe(updated.toISOString());
  });

  it('preserves optional ownership lineage fields when set', () => {
    const sheet = mapCharacterSheetRow({
      id: '22222222-2222-2222-2222-222222222222',
      ownerId: 'owner-b',
      name: 'Borin',
      gameSystemId: 'ironsworn',
      fields: [],
      originSystemId: 'generic',
      lineageSheetId: '11111111-1111-1111-1111-111111111111',
      portraitUrl: 'https://example.com/p.png',
      layout: null,
      createdAt: new Date('2026-02-01T00:00:00.000Z'),
      updatedAt: new Date('2026-02-02T00:00:00.000Z'),
    });

    expect(sheet.originSystemId).toBe('generic');
    expect(sheet.lineageSheetId).toBe('11111111-1111-1111-1111-111111111111');
    expect(sheet.portraitUrl).toBe('https://example.com/p.png');
  });
});
