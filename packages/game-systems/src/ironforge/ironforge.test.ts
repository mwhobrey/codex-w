import { describe, expect, it } from 'vitest';
import { ironforgePlugin } from './index';

describe('ironforgePlugin', () => {
  it('uses vow-progress solo engine', () => {
    expect(ironforgePlugin.soloEngine?.kind).toBe('vow-progress');
    expect(ironforgePlugin.soloEngine?.vowProgress?.progressMax).toBe(10);
  });

  it('creates an ironforge character sheet', () => {
    const sheet = ironforgePlugin.createEmptySheet('Cinder', 'owner-1');
    expect(sheet.gameSystemId).toBe('ironforge');
    expect(sheet.fields.find((f) => f.key === 'iron_oath')).toBeDefined();
    expect(sheet.fields.find((f) => f.key === 'grit')).toBeDefined();
  });
});
