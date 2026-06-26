import type { CharacterSheet } from '@codex/schemas';
import { clearSheetFieldValue, getSheetFieldValue, setSheetFieldValue } from '../field-access';
import type { PromptEntry } from '../types';
import { getTyovCapacity } from './capacity';
import { TYOV_SLOT_KEYS, type TyovSlotKind } from './slots';

export type TyovPromptAction = 'gain' | 'loss' | 'bond' | 'diary' | 'none';

export interface TyovPromptGuidance {
  action: TyovPromptAction;
  summary: string;
  suggestedFieldKey?: string;
  blocked: boolean;
  blockReason?: string;
}

function inferSlotKind(prompt: PromptEntry): TyovSlotKind | null {
  const hint = prompt.hint?.toLowerCase() ?? '';
  if (prompt.tags?.includes('bond')) return 'character';
  if (hint.includes('memory')) return 'memory';
  if (hint.includes('skill')) return 'skill';
  if (hint.includes('resource')) return 'resource';
  if (hint.includes('character')) return 'character';
  if (prompt.tags?.includes('gain')) return 'memory';
  if (prompt.tags?.includes('loss')) return 'memory';
  return null;
}

export function firstEmptySlotKey(sheet: CharacterSheet, kind: TyovSlotKind): string | null {
  for (const key of TYOV_SLOT_KEYS[kind]) {
    if (!getSheetFieldValue(sheet, key)) return key;
  }
  return null;
}

export function lastFilledSlotKey(sheet: CharacterSheet, kind: TyovSlotKind): string | null {
  const keys = [...TYOV_SLOT_KEYS[kind]].reverse();
  for (const key of keys) {
    if (getSheetFieldValue(sheet, key)) return key;
  }
  return null;
}

export function buildTyovPromptGuidance(
  prompt: PromptEntry,
  sheet: CharacterSheet | null,
): TyovPromptGuidance {
  const tags = prompt.tags ?? [];
  const isLoss = tags.includes('loss');
  const isGain = tags.includes('gain') || tags.includes('bond');
  const isDiary = tags.includes('diary');

  if (!sheet || sheet.gameSystemId !== 'totv') {
    return {
      action: isDiary ? 'diary' : isLoss ? 'loss' : isGain ? 'gain' : 'none',
      summary: prompt.hint ?? 'Link a TYOV character to apply sheet changes.',
      blocked: isGain || isLoss,
      blockReason: 'No TYOV character linked',
    };
  }

  const kind = inferSlotKind(prompt);
  const capacity = getTyovCapacity(sheet);

  if (isDiary) {
    return {
      action: 'diary',
      summary: 'Write in your diary field on the character sheet.',
      suggestedFieldKey: 'diary',
      blocked: false,
    };
  }

  if (isLoss && kind) {
    const key = lastFilledSlotKey(sheet, kind);
    if (!key) {
      return {
        action: 'loss',
        summary: `No filled ${kind} slot to clear.`,
        blocked: true,
        blockReason: `All ${kind} slots are empty`,
      };
    }
    return {
      action: 'loss',
      summary: `Clear ${key.replace('_', ' ')} to make room.`,
      suggestedFieldKey: key,
      blocked: false,
    };
  }

  if ((isGain || tags.includes('bond')) && kind) {
    const capBucket =
      kind === 'memory'
        ? capacity?.memories
        : kind === 'skill'
          ? capacity?.skills
          : kind === 'resource'
            ? capacity?.resources
            : capacity?.characters;
    const key = firstEmptySlotKey(sheet, kind);
    if (!key) {
      return {
        action: 'gain',
        summary: `All ${kind} slots are full — lose something first.`,
        blocked: true,
        blockReason: capBucket ? `${capBucket.filled}/${capBucket.max} slots filled` : undefined,
      };
    }
    return {
      action: 'gain',
      summary: `Fill ${key.replace('_', ' ')} from this prompt.`,
      suggestedFieldKey: key,
      blocked: false,
    };
  }

  return {
    action: 'none',
    summary: prompt.hint ?? 'Log the prompt, then edit your sheet as needed.',
    blocked: false,
  };
}

export function seedTyovSlotFromPrompt(
  sheet: CharacterSheet,
  fieldKey: string,
  prompt: PromptEntry,
): CharacterSheet {
  const seed = `[Prompt ${prompt.id}] `;
  if (getSheetFieldValue(sheet, fieldKey)) return sheet;
  return setSheetFieldValue(sheet, fieldKey, seed);
}

export function clearTyovSlot(sheet: CharacterSheet, fieldKey: string): CharacterSheet {
  return clearSheetFieldValue(sheet, fieldKey);
}
