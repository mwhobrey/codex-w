import { describe, expect, it } from 'vitest';
import { getCharacterPeekSummary } from './character-peek';
import { ironswornPlugin } from './ironsworn';
import { lonerPlugin } from './loner';
import { snallygasterPlugin } from './snallygaster';
import { totvPlugin } from './totv';
import { updateSheetField } from './types';

describe('getCharacterPeekSummary', () => {
  it('uses totv vampire identity and diary', () => {
    let sheet = totvPlugin.createEmptySheet('Diary Keep', 'owner');
    sheet = updateSheetField(sheet, 'vampire_name', 'Countess Red');
    sheet = updateSheetField(sheet, 'human_name', 'Rita');
    sheet = updateSheetField(sheet, 'diary', 'Night notes');

    const peek = getCharacterPeekSummary(sheet);
    expect(peek.headlineLabel).toBe('Identity');
    expect(peek.headline).toBe('Countess Red');
    expect(peek.summary).toBe('Night notes');
  });

  it('uses ironsworn vow and background', () => {
    let sheet = ironswornPlugin.createEmptySheet('Vow Keeper', 'owner');
    sheet = updateSheetField(sheet, 'iron_vow', 'Protect the forge');
    sheet = updateSheetField(sheet, 'background', 'Exiled smith');

    const peek = getCharacterPeekSummary(sheet);
    expect(peek.headlineLabel).toBe('Vow');
    expect(peek.headline).toBe('Protect the forge');
    expect(peek.summary).toBe('Exiled smith');
  });

  it('uses snallygaster motivation with camp details', () => {
    let sheet = snallygasterPlugin.createEmptySheet('Camper', 'owner');
    sheet = updateSheetField(sheet, 'motivation', 'Win color wars');
    sheet = updateSheetField(sheet, 'camp_name', 'Pine Lodge');
    sheet = updateSheetField(sheet, 'number', '7');
    sheet = updateSheetField(sheet, 'style', 'Loud shirts');

    const peek = getCharacterPeekSummary(sheet);
    expect(peek.headlineLabel).toBe('Motivation');
    expect(peek.headline).toBe('Win color wars');
    expect(peek.summary).toBe('Loud shirts');
    expect(peek.details).toEqual(
      expect.arrayContaining([
        { label: 'Number', value: '7', fieldKey: 'number' },
        { label: 'Camp', value: 'Pine Lodge', fieldKey: 'camp_name' },
        { label: 'Motivation', value: 'Win color wars', fieldKey: 'motivation' },
      ]),
    );
  });

  it('uses loner concept and luck details', () => {
    let sheet = lonerPlugin.createEmptySheet('Kael', 'owner');
    sheet = updateSheetField(sheet, 'concept', 'Street cat');
    sheet = updateSheetField(sheet, 'motive', 'Find the archive');
    sheet = updateSheetField(sheet, 'luck', '3');
    sheet = updateSheetField(sheet, 'nemesis', 'Syndicate');

    const peek = getCharacterPeekSummary(sheet);
    expect(peek.headlineLabel).toBe('Concept');
    expect(peek.headline).toBe('Street cat');
    expect(peek.summary).toBe('Find the archive');
    expect(peek.details).toEqual(
      expect.arrayContaining([
        { label: 'Luck', value: '3', fieldKey: 'luck' },
        { label: 'Motive', value: 'Find the archive', fieldKey: 'motive' },
        { label: 'Nemesis', value: 'Syndicate', fieldKey: 'nemesis' },
      ]),
    );
  });
});
