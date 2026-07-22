import { describe, expect, it } from 'vitest';
import { totvPlugin } from './index';

describe('totvPlugin', () => {
  it('uses prompt-journal solo engine with expanded original prompts', () => {
    expect(totvPlugin.soloEngine?.kind).toBe('prompt-journal');
    expect(totvPlugin.soloEngine?.prompts?.length).toBe(60);
    expect(totvPlugin.soloEngine?.promptAdvance?.maxPrompt).toBe(60);
  });

  it('creates a TYOV character sheet with Marks and mortal setup', () => {
    const sheet = totvPlugin.createEmptySheet('Marcel', 'owner-1');
    expect(sheet.gameSystemId).toBe('totv');
    expect(sheet.fields.find((f) => f.key === 'memory_1')).toBeDefined();
    expect(sheet.fields.find((f) => f.key === 'vampire_name')).toBeDefined();
    expect(sheet.fields.find((f) => f.key === 'mortal_station')).toBeDefined();
    expect(sheet.fields.find((f) => f.key === 'mark_1')).toBeDefined();
    expect(sheet.fields.find((f) => f.key === 'how_turned')).toBeDefined();
  });
});
