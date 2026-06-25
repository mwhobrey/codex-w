import { describe, expect, it } from 'vitest';
import { genericPlugin } from './index';

describe('genericPlugin', () => {
  it('creates a sheet with all defined fields', () => {
    const sheet = genericPlugin.createEmptySheet('Test Hero', 'owner-1');

    expect(sheet.name).toBe('Test Hero');
    expect(sheet.gameSystemId).toBe('generic');
    expect(sheet.ownerId).toBe('owner-1');
    expect(sheet.fields.length).toBeGreaterThan(10);
    expect(sheet.fields.find((field) => field.key === 'concept')).toMatchObject({
      label: 'Concept',
      value: '',
    });
  });
});
