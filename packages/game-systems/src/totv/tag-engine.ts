import type { CharacterSheet } from '@codex/schemas';
import { clearSheetFieldValue, getSheetFieldValue, setSheetFieldValue } from '../field-access';
import type { PromptEntry } from '../types';
import { getTyovCapacity } from './capacity';
import {
  appendExperience,
  firstMemoryWithRoom,
  lastMemoryWithExperience,
} from './experiences';
import { TYOV_SLOT_KEYS, type TyovSlotKind } from './slots';

export type TyovPromptAction = 'gain' | 'loss' | 'bond' | 'diary' | 'mark' | 'none';

export interface TyovPromptGuidance {
  action: TyovPromptAction;
  summary: string;
  suggestedFieldKey?: string;
  blocked: boolean;
  blockReason?: string;
  /** When blocked on memory gain, panel can offer forget/compress. */
  canMakeRoom?: boolean;
}

function inferSlotKind(prompt: PromptEntry): TyovSlotKind | null {
  const hint = prompt.hint?.toLowerCase() ?? '';
  const tags = prompt.tags ?? [];
  if (tags.includes('mark') || hint.includes('mark')) return 'mark';
  if (tags.includes('bond') || hint.includes('character')) return 'character';
  if (hint.includes('memory') || hint.includes('experience')) return 'memory';
  if (hint.includes('skill')) return 'skill';
  if (hint.includes('resource')) return 'resource';
  if (tags.includes('gain') && !tags.includes('diary')) return 'memory';
  if (tags.includes('loss')) return 'memory';
  return null;
}

export function firstEmptySlotKey(sheet: CharacterSheet, kind: TyovSlotKind): string | null {
  if (kind === 'memory') return firstMemoryWithRoom(sheet);
  for (const key of TYOV_SLOT_KEYS[kind]) {
    if (!getSheetFieldValue(sheet, key)) return key;
  }
  return null;
}

export function lastFilledSlotKey(sheet: CharacterSheet, kind: TyovSlotKind): string | null {
  if (kind === 'memory') return lastMemoryWithExperience(sheet);
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
  const isMark = tags.includes('mark');
  const isGain = tags.includes('gain') || tags.includes('bond') || isMark;
  const isDiary = tags.includes('diary');

  if (!sheet || sheet.gameSystemId !== 'totv') {
    return {
      action: isDiary
        ? 'diary'
        : isMark
          ? 'mark'
          : isLoss
            ? 'loss'
            : isGain
              ? 'gain'
              : 'none',
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
      summary: 'Append a diary stanza from this prompt, then edit on your sheet.',
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
    const lossSummary =
      kind === 'memory'
        ? `Forget an Experience from ${key.replace('_', ' ')} (or compress / clear the memory).`
        : `Clear ${key.replace('_', ' ')} to make room.`;
    return {
      action: 'loss',
      summary: lossSummary,
      suggestedFieldKey: key,
      blocked: false,
      canMakeRoom: kind === 'memory',
    };
  }

  if ((isGain || tags.includes('bond') || isMark) && kind) {
    const capBucket =
      kind === 'memory'
        ? capacity?.experiences
        : kind === 'skill'
          ? capacity?.skills
          : kind === 'resource'
            ? capacity?.resources
            : kind === 'mark'
              ? capacity?.marks
              : capacity?.characters;
    const key = firstEmptySlotKey(sheet, kind);
    if (!key) {
      return {
        action: kind === 'mark' ? 'mark' : 'gain',
        summary:
          kind === 'memory'
            ? 'All Experiences are full (3 per memory) — forget or compress first.'
            : `All ${kind} slots are full — lose something first.`,
        blocked: true,
        blockReason: capBucket ? `${capBucket.filled}/${capBucket.max} filled` : undefined,
        canMakeRoom: kind === 'memory',
        suggestedFieldKey: lastMemoryWithExperience(sheet) ?? undefined,
      };
    }
    return {
      action: kind === 'mark' ? 'mark' : tags.includes('bond') ? 'bond' : 'gain',
      summary:
        kind === 'memory'
          ? `Add an Experience to ${key.replace('_', ' ')}.`
          : `Fill ${key.replace('_', ' ')} from this prompt.`,
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
  if (fieldKey.startsWith('memory_')) {
    const next = appendExperience(sheet, fieldKey, seed.trimEnd());
    return next ?? sheet;
  }
  if (getSheetFieldValue(sheet, fieldKey)) return sheet;
  return setSheetFieldValue(sheet, fieldKey, seed);
}

export function appendDiaryFromPrompt(
  sheet: CharacterSheet,
  prompt: PromptEntry,
): CharacterSheet {
  const existing = getSheetFieldValue(sheet, 'diary');
  const stanza = `— Prompt ${prompt.id} —\n`;
  const next = existing ? `${existing.trimEnd()}\n\n${stanza}` : stanza;
  return setSheetFieldValue(sheet, 'diary', next);
}

export function diaryPreviewLine(sheet: CharacterSheet | null): string {
  if (!sheet) return '';
  const lines = getSheetFieldValue(sheet, 'diary')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  return lines[lines.length - 1] ?? '';
}

export function clearTyovSlot(sheet: CharacterSheet, fieldKey: string): CharacterSheet {
  return clearSheetFieldValue(sheet, fieldKey);
}
