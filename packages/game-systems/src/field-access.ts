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

export function setSheetFieldValue(
  sheet: CharacterSheet,
  key: string,
  value: string | number | boolean | string[],
): CharacterSheet {
  const now = new Date().toISOString();
  const fields = sheet.fields.map((field) =>
    field.key === key ? { ...field, value } : field,
  );
  return { ...sheet, fields, updatedAt: now };
}

export function clearSheetFieldValue(sheet: CharacterSheet, key: string): CharacterSheet {
  const field = sheet.fields.find((f) => f.key === key);
  if (!field) return sheet;
  const empty = Array.isArray(field.value) ? [] : field.type === 'number' ? 0 : '';
  return setSheetFieldValue(sheet, key, empty as string | number | boolean | string[]);
}
