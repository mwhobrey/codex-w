import { describe, expect, it } from 'vitest';
import { resolveTablePanelId } from './table-panels';

describe('resolveTablePanelId', () => {
  it('maps ironsworn engine to ironsworn panel', () => {
    expect(resolveTablePanelId('ironsworn')).toBe('ironsworn');
  });

  it('maps loner oracle to loner panel', () => {
    expect(resolveTablePanelId('loner-oracle')).toBe('loner');
  });
});
