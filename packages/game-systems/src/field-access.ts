import type { CharacterSheet } from '@codex/schemas';

export function getFieldValue(sheet: CharacterSheet, key: string): string {
  const field = sheet.fields.find((f) => f.key === key);
  if (!field) return '';
  if (Array.isArray(field.value)) {
    return field.value.filter(Boolean).join(', ');
  }
  if (field.value === '' || field.value === 0 || field.value === false) return '';
  return String(field.value);
}

export function getSheetFieldValue(sheet: CharacterSheet, key: string): string {
  return getFieldValue(sheet, key);
}
