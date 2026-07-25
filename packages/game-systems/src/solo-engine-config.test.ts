import { describe, expect, it } from 'vitest';
import { listAvailableSystems } from './registry';
import { resolveTablePanelId } from './table-panels';
import type { SoloEngineKind } from './types';

const EXPECTED_KINDS: SoloEngineKind[] = [
  'oracle',
  'loner-oracle',
  'prompt-journal',
  'lasers-feelings',
  'ironsworn',
  'mentor',
];

describe('SoloEngineConfig registry', () => {
  it('gives every solo plugin a discriminated kind that maps to a table panel', () => {
    const soloPlugins = listAvailableSystems().filter((plugin) => plugin.soloEngine);

    expect(soloPlugins.length).toBeGreaterThan(0);

    for (const plugin of soloPlugins) {
      const engine = plugin.soloEngine!;
      expect(EXPECTED_KINDS).toContain(engine.kind);
      expect(resolveTablePanelId(engine.kind)).not.toBeNull();
    }
  });

  it('maps known system ids to expected panel ids via engine kind', () => {
    const byId = Object.fromEntries(listAvailableSystems().map((p) => [p.id, p]));

    expect(resolveTablePanelId(byId.loner?.soloEngine?.kind)).toBe('loner');
    expect(resolveTablePanelId(byId['paranormal-files']?.soloEngine?.kind)).toBe('loner');
    expect(resolveTablePanelId(byId.totv?.soloEngine?.kind)).toBe('totv');
    expect(resolveTablePanelId(byId.snallygaster?.soloEngine?.kind)).toBe('snallygaster');
    expect(resolveTablePanelId(byId.ironsworn?.soloEngine?.kind)).toBe('ironsworn');
    expect(resolveTablePanelId(byId.muscadines?.soloEngine?.kind)).toBe('muscadines');
    expect(resolveTablePanelId(byId.generic?.soloEngine?.kind)).toBe('system');
  });
});
