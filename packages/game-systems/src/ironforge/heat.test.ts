import { describe, expect, it } from 'vitest';
import { ironforgePlugin } from './index';
import { bumpIronforgeHeat, getIronforgeHeat, IRONFORGE_HEAT_MAX } from './heat';

describe('ironforge heat', () => {
  it('bumps and clamps heat on the sheet', () => {
    const sheet = ironforgePlugin.createEmptySheet('Ash', 'owner');
    expect(getIronforgeHeat(sheet)).toBe(0);
    const warmed = bumpIronforgeHeat(sheet, 2);
    expect(getIronforgeHeat(warmed)).toBe(2);
    const maxed = bumpIronforgeHeat(warmed, IRONFORGE_HEAT_MAX);
    expect(getIronforgeHeat(maxed)).toBe(IRONFORGE_HEAT_MAX);
  });
});
