import { describe, expect, it } from 'vitest';
import { muscadinesPlugin } from './index';

describe('muscadinesPlugin', () => {
  it('uses mentor solo engine with oracles', () => {
    expect(muscadinesPlugin.soloEngine?.kind).toBe('mentor');
    expect(muscadinesPlugin.soloEngine?.mentorPrompts?.length).toBeGreaterThanOrEqual(10);
    expect(muscadinesPlugin.soloEngine?.oracleLikelihoods).toHaveLength(5);
  });

  it('creates a marmateer character sheet', () => {
    const sheet = muscadinesPlugin.createEmptySheet('Rowan', 'owner-1');
    expect(sheet.gameSystemId).toBe('muscadines');
    expect(sheet.fields.find((f) => f.key === 'jam_specialty')).toBeDefined();
  });
});
