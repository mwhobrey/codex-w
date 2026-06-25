import type { CharacterSheet } from '@codex/schemas';
import { getSheetFieldValue } from '@codex/game-systems';

const URL_PATTERN = /^https?:\/\//i;

function isUrl(value: string): boolean {
  return URL_PATTERN.test(value.trim());
}

/** Portrait for map tokens — explicit field first, then legacy `portrait` sheet field. */
export function readCharacterPortraitUrl(sheet: CharacterSheet | null | undefined): string | undefined {
  if (!sheet) return undefined;
  if (sheet.portraitUrl?.trim()) return sheet.portraitUrl.trim();

  const fromField = getSheetFieldValue(sheet, 'portrait');
  if (typeof fromField === 'string' && isUrl(fromField)) return fromField.trim();

  return undefined;
}
