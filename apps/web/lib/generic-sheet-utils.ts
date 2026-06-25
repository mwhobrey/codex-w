import type { CharacterSheet, CharacterSheetField } from '@codex/schemas';
import { renameSheet, updateSheetField } from '@codex/game-systems';

/** Coerce legacy textarea equipment into a list field. */
export function normalizeListFields(sheet: CharacterSheet): CharacterSheet {
  let changed = false;
  const fields = sheet.fields.map((field) => {
    if (field.key !== 'equipment' || field.type === 'list') return field;
    if (field.type !== 'textarea' && field.type !== 'text') return field;
    changed = true;
    const raw = String(field.value).trim();
    const items = raw
      ? raw
          .split(/\n+/)
          .map((line) => line.replace(/^[-•*]\s*/, '').trim())
          .filter(Boolean)
      : [];
    return { ...field, type: 'list' as const, value: items };
  });
  if (!changed) return sheet;
  return { ...sheet, fields, updatedAt: new Date().toISOString() };
}

export function getFieldDisplayLabel(sheet: CharacterSheet, field: CharacterSheetField): string {
  return sheet.layout?.fieldLabels?.[field.key] ?? field.label;
}

export function updateBuiltinFieldLabel(
  sheet: CharacterSheet,
  key: string,
  label: string,
): CharacterSheet {
  const trimmed = label.trim();
  const fieldLabels = { ...(sheet.layout?.fieldLabels ?? {}) };
  if (!trimmed || trimmed === sheet.fields.find((f) => f.key === key)?.label) {
    delete fieldLabels[key];
  } else {
    fieldLabels[key] = trimmed;
  }
  const now = new Date().toISOString();
  return {
    ...sheet,
    layout: {
      hiddenFieldKeys: sheet.layout?.hiddenFieldKeys ?? [],
      ...(Object.keys(fieldLabels).length > 0 ? { fieldLabels } : {}),
    },
    updatedAt: now,
  };
}

export function syncGenericCharacterName(
  sheet: CharacterSheet,
  givenName: string,
): CharacterSheet {
  const displayName = givenName.trim() || 'Unnamed character';
  let next = updateSheetField(sheet, 'given_name', givenName);
  if (next.name !== displayName) {
    next = renameSheet(next, displayName);
  }
  return next;
}

export function coerceListValue(value: CharacterSheetField['value']): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(/\n+/)
      .map((line) => line.replace(/^[-•*]\s*/, '').trim())
      .filter(Boolean);
  }
  return [];
}
