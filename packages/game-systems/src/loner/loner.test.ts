import { describe, expect, it } from 'vitest';
import { lonerPlugin } from './index';

describe('lonerPlugin', () => {
  it('includes Chance/Risk solo engine config', () => {
    expect(lonerPlugin.soloEngine?.kind).toBe('loner-oracle');
    expect(lonerPlugin.soloEngine?.twistSubjects).toHaveLength(6);
    expect(lonerPlugin.soloEngine?.twistActions).toHaveLength(6);
    expect(lonerPlugin.soloEngine?.twistTable).toHaveLength(6);
  });

  it('creates a Loner character sheet with SRD tags', () => {
    const sheet = lonerPlugin.createEmptySheet('The Stranger', 'owner-1');
    expect(sheet.gameSystemId).toBe('loner');
    expect(sheet.fields.find((f) => f.key === 'concept')).toBeDefined();
    expect(sheet.fields.find((f) => f.key === 'skill1')).toBeDefined();
    expect(sheet.fields.find((f) => f.key === 'skill2')).toBeDefined();
    expect(sheet.fields.find((f) => f.key === 'frailty')).toBeDefined();
    expect(sheet.fields.find((f) => f.key === 'gear1')).toBeDefined();
    expect(sheet.fields.find((f) => f.key === 'gear2')).toBeDefined();
    expect(sheet.fields.find((f) => f.key === 'gear3')).toBeUndefined();
    expect(sheet.fields.find((f) => f.key === 'goal')).toBeDefined();
    expect(sheet.fields.find((f) => f.key === 'nemesis')).toBeDefined();
    expect(sheet.fields.find((f) => f.key === 'luck')?.value).toBe(6);
  });
});
