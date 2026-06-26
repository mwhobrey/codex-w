import { describe, expect, it } from 'vitest';
import { resolveTablePanelId, supportsTablePlayPanel } from './table-panels';

describe('table panel registry', () => {
  it('maps engine kinds to panel ids', () => {
    expect(resolveTablePanelId('prompt-journal')).toBe('totv');
    expect(resolveTablePanelId('lasers-feelings')).toBe('snallygaster');
    expect(resolveTablePanelId('vow-progress')).toBe('ironforge');
    expect(resolveTablePanelId('mentor')).toBe('muscadines');
    expect(resolveTablePanelId('oracle')).toBe('system');
  });

  it('returns null for undefined kind', () => {
    expect(resolveTablePanelId(undefined)).toBeNull();
    expect(supportsTablePlayPanel(undefined)).toBe(false);
  });
});
