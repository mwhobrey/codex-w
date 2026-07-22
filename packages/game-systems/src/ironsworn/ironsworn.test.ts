import { describe, expect, it } from 'vitest';
import { ironswornPlugin } from './index';
import { actionOracle, themeOracle, lookupOracleD100 } from './oracles';
import { createVow, markVowProgress, vowsProgressScore } from './vows';

describe('ironswornPlugin', () => {
  it('uses ironsworn solo engine with moves and oracles', () => {
    expect(ironswornPlugin.soloEngine?.kind).toBe('ironsworn');
    expect(ironswornPlugin.soloEngine?.ironsworn?.moves.length).toBeGreaterThan(5);
    expect(ironswornPlugin.soloEngine?.ironsworn?.oracles.length).toBeGreaterThan(2);
    expect(ironswornPlugin.soloEngine?.ironsworn?.assets.length).toBeGreaterThan(3);
  });

  it('creates an ironsworn character sheet', () => {
    const sheet = ironswornPlugin.createEmptySheet('Riven', 'owner-1');
    expect(sheet.gameSystemId).toBe('ironsworn');
    expect(sheet.fields.some((f) => f.key === 'edge')).toBe(true);
    expect(sheet.fields.some((f) => f.key === 'momentum')).toBe(true);
  });

  it('has full action and theme oracle tables', () => {
    expect(actionOracle).toHaveLength(100);
    expect(themeOracle).toHaveLength(100);
    expect(lookupOracleD100(actionOracle, 1)).toBeTruthy();
    expect(lookupOracleD100(themeOracle, 100)).toBeTruthy();
  });

  it('marks vow progress by rank', () => {
    const vow = createVow('Find the blade', 'dangerous');
    const marked = markVowProgress(vow, 1);
    expect(marked.ticks).toBe(8);
    expect(vowsProgressScore(marked)).toBe(2);
  });
});

describe('legacy ironforge alias', () => {
  it('resolves ironforge to ironsworn plugin', async () => {
    const { getGameSystem, normalizeGameSystemId } = await import('../registry');
    expect(normalizeGameSystemId('ironforge')).toBe('ironsworn');
    expect(getGameSystem('ironforge').id).toBe('ironsworn');
  });
});
