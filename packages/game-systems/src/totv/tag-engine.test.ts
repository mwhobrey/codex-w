import { describe, expect, it } from 'vitest';
import {
  appendExperience,
  compressMemory,
  forgetOldestExperience,
  parseExperiences,
} from './experiences';
import { totvPlugin } from './index';
import { buildTyovPromptGuidance, seedTyovSlotFromPrompt } from './tag-engine';
import { totvPrompts } from './prompts';
import { setSheetFieldValue } from '../field-access';

describe('TYOV experiences', () => {
  it('parses newline-separated Experiences (max 3)', () => {
    expect(parseExperiences('a\n\nb\nc\nd')).toEqual(['a', 'b', 'c']);
  });

  it('appends until full', () => {
    let sheet = totvPlugin.createEmptySheet('Vera', 'o1');
    sheet = appendExperience(sheet, 'memory_1', 'First')!;
    sheet = appendExperience(sheet, 'memory_1', 'Second')!;
    sheet = appendExperience(sheet, 'memory_1', 'Third')!;
    expect(appendExperience(sheet, 'memory_1', 'Fourth')).toBeNull();
    expect(parseExperiences(sheet.fields.find((f) => f.key === 'memory_1')!.value as string)).toHaveLength(
      3,
    );
  });

  it('forgets oldest and compresses', () => {
    let sheet = totvPlugin.createEmptySheet('Vera', 'o1');
    sheet = setSheetFieldValue(sheet, 'memory_1', 'One\nTwo\nThree');
    sheet = forgetOldestExperience(sheet, 'memory_1');
    expect(parseExperiences(sheet.fields.find((f) => f.key === 'memory_1')!.value as string)).toEqual([
      'Two',
      'Three',
    ]);
    sheet = compressMemory(sheet, 'memory_1');
    expect(parseExperiences(sheet.fields.find((f) => f.key === 'memory_1')!.value as string)).toEqual([
      'Two; Three',
    ]);
  });
});

describe('TYOV tag engine', () => {
  const sheet = totvPlugin.createEmptySheet('Vera', 'owner-1');

  it('guides gain prompts to empty slots', () => {
    const prompt = totvPrompts.find((p) => p.id === 6)!;
    const guidance = buildTyovPromptGuidance(prompt, sheet);
    expect(guidance.action).toBe('gain');
    expect(guidance.suggestedFieldKey).toBe('skill_1');
    expect(guidance.blocked).toBe(false);
  });

  it('blocks gain when slots are full', () => {
    let full = sheet;
    for (let i = 1; i <= 5; i += 1) {
      full = seedTyovSlotFromPrompt(full, `skill_${i}`, { id: 6, text: 'x', tags: ['gain'] });
      full = {
        ...full,
        fields: full.fields.map((f) =>
          f.key === `skill_${i}` ? { ...f, value: `Skill ${i}` } : f,
        ),
      };
    }
    const guidance = buildTyovPromptGuidance(totvPrompts.find((p) => p.id === 6)!, full);
    expect(guidance.blocked).toBe(true);
  });

  it('blocks memory gain when all Experiences are full and offers make-room', () => {
    let full = sheet;
    for (let i = 1; i <= 5; i += 1) {
      full = setSheetFieldValue(full, `memory_${i}`, 'a\nb\nc');
    }
    const prompt = totvPrompts.find((p) => p.id === 10)!;
    const guidance = buildTyovPromptGuidance(prompt, full);
    expect(guidance.blocked).toBe(true);
    expect(guidance.canMakeRoom).toBe(true);
    expect(guidance.suggestedFieldKey).toBe('memory_5');
  });

  it('guides mark prompts to mark slots', () => {
    const prompt = totvPrompts.find((p) => p.id === 12)!;
    const guidance = buildTyovPromptGuidance(prompt, sheet);
    expect(guidance.action).toBe('mark');
    expect(guidance.suggestedFieldKey).toBe('mark_1');
  });

  it('clears guidance for loss on a filled memory', () => {
    const filled = setSheetFieldValue(sheet, 'memory_1', 'A vivid night');
    const lossPrompt = totvPrompts.find((p) => p.id === 13)!;
    const guidance = buildTyovPromptGuidance(lossPrompt, filled);
    expect(guidance.action).toBe('loss');
    expect(guidance.suggestedFieldKey).toBe('memory_1');
  });

  it('guides diary prompts', () => {
    const prompt = totvPrompts.find((p) => p.id === 9)!;
    const guidance = buildTyovPromptGuidance(prompt, sheet);
    expect(guidance.action).toBe('diary');
    expect(guidance.suggestedFieldKey).toBe('diary');
  });
});
