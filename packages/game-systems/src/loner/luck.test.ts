import { describe, expect, it } from 'vitest';
import { lonerPlugin } from './index';
import { applyTakeHarmToLuck, getLonerLuck, rechargeLonerLuck } from './luck';

describe('loner luck', () => {
  it('applies take harm and recharges to 6', () => {
    let sheet = lonerPlugin.createEmptySheet('Kael', 'owner');
    expect(getLonerLuck(sheet)).toBe(6);
    sheet = applyTakeHarmToLuck(sheet, 2);
    expect(getLonerLuck(sheet)).toBe(4);
    sheet = rechargeLonerLuck(sheet);
    expect(getLonerLuck(sheet)).toBe(6);
  });
});
