import { describe, expect, it } from 'vitest';
import { lonerPlugin } from './index';

describe('lonerPlugin', () => {
  it('includes solo engine config', () => {
    expect(lonerPlugin.soloEngine).toBeDefined();
    expect(lonerPlugin.soloEngine?.oracleLikelihoods).toHaveLength(5);
    expect(lonerPlugin.soloEngine?.twistTable).toHaveLength(6);
  });

  it('creates a loner character sheet', () => {
    const sheet = lonerPlugin.createEmptySheet('The Stranger', 'owner-1');
    expect(sheet.gameSystemId).toBe('loner');
    expect(sheet.fields.find((f) => f.key === 'goal')).toBeDefined();
    expect(sheet.fields.find((f) => f.key === 'nemesis')).toBeDefined();
  });
});
