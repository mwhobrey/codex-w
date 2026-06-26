import { describe, expect, it } from 'vitest';
import { totvPlugin } from './index';
import { buildTyovPromptGuidance, clearTyovSlot, seedTyovSlotFromPrompt } from './tag-engine';
import { totvPrompts } from './prompts';

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
      full = { ...full, fields: full.fields.map((f) =>
        f.key === `skill_${i}` ? { ...f, value: `Skill ${i}` } : f,
      ) };
    }
    const guidance = buildTyovPromptGuidance(totvPrompts.find((p) => p.id === 6)!, full);
    expect(guidance.blocked).toBe(true);
  });

  it('clears a slot for loss prompts', () => {
    const withMemory = seedTyovSlotFromPrompt(sheet, 'memory_1', {
      id: 10,
      text: 'memory',
      tags: ['gain'],
    });
    const filled = {
      ...withMemory,
      fields: withMemory.fields.map((f) =>
        f.key === 'memory_1' ? { ...f, value: 'A vivid night' } : f,
      ),
    };
    const lossPrompt = totvPrompts.find((p) => p.id === 12)!;
    const guidance = buildTyovPromptGuidance(lossPrompt, filled);
    expect(guidance.action).toBe('loss');
    expect(guidance.suggestedFieldKey).toBe('memory_1');
    const cleared = clearTyovSlot(filled, 'memory_1');
    expect(cleared.fields.find((f) => f.key === 'memory_1')?.value).toBe('');
  });
});
