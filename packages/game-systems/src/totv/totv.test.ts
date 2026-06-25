import { describe, expect, it } from 'vitest';
import { totvPlugin } from './index';

describe('totvPlugin', () => {
  it('uses prompt-journal solo engine', () => {
    expect(totvPlugin.soloEngine?.kind).toBe('prompt-journal');
    expect(totvPlugin.soloEngine?.prompts?.length).toBeGreaterThanOrEqual(30);
  });

  it('creates a TYOV character sheet', () => {
    const sheet = totvPlugin.createEmptySheet('Marcel', 'owner-1');
    expect(sheet.gameSystemId).toBe('totv');
    expect(sheet.fields.find((f) => f.key === 'memory_1')).toBeDefined();
    expect(sheet.fields.find((f) => f.key === 'vampire_name')).toBeDefined();
  });
});
