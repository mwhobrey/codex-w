import { describe, expect, it } from 'vitest';
import { getTyovCapacity } from './capacity';
import { totvPlugin } from './index';
import { setSheetFieldValue } from '../field-access';

describe('getTyovCapacity', () => {
  it('counts Experiences across memories and Marks', () => {
    let sheet = totvPlugin.createEmptySheet('Vera', 'o1');
    sheet = setSheetFieldValue(sheet, 'memory_1', 'a\nb');
    sheet = setSheetFieldValue(sheet, 'mark_1', 'Ashen eyes');
    const cap = getTyovCapacity(sheet)!;
    expect(cap.memories.filled).toBe(1);
    expect(cap.experiences.filled).toBe(2);
    expect(cap.experiences.max).toBe(15);
    expect(cap.marks.filled).toBe(1);
  });
});
