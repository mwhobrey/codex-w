import { describe, expect, it } from 'vitest';
import { snallygasterPlugin } from './index';

describe('snallygasterPlugin', () => {
  it('uses lasers-feelings solo engine', () => {
    expect(snallygasterPlugin.soloEngine?.kind).toBe('lasers-feelings');
    expect(snallygasterPlugin.soloEngine?.lasersFeelings?.problemTable).toHaveLength(12);
    expect(snallygasterPlugin.soloEngine?.lasersFeelings?.activityTable).toHaveLength(8);
  });

  it('creates a camp character sheet', () => {
    const sheet = snallygasterPlugin.createEmptySheet('Casey', 'owner-1');
    expect(sheet.gameSystemId).toBe('snallygaster');
    expect(sheet.fields.find((f) => f.key === 'counselor_stat')).toBeDefined();
  });
});
