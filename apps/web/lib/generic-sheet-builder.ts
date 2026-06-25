import type { CharacterSheet, CharacterSheetField } from '@codex/schemas';
import type { SheetFieldDefinition } from '@codex/game-systems';

export const CUSTOM_FIELD_PREFIX = 'custom:';

export function isCustomFieldKey(key: string): boolean {
  return key.startsWith(CUSTOM_FIELD_PREFIX);
}

export function listDefinitionKeys(definitions: SheetFieldDefinition[]): Set<string> {
  return new Set(definitions.map((field) => field.key));
}

export function getCustomFields(sheet: CharacterSheet, definitionKeys: Set<string>): CharacterSheetField[] {
  return sheet.fields.filter(
    (field) => isCustomFieldKey(field.key) || !definitionKeys.has(field.key),
  );
}

export function addCustomField(
  sheet: CharacterSheet,
  input: {
    label: string;
    type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox';
    options?: string[];
  },
): CharacterSheet {
  const key = `${CUSTOM_FIELD_PREFIX}${crypto.randomUUID()}`;
  const field: CharacterSheetField = {
    key,
    label: input.label.trim() || 'Custom field',
    type: input.type,
    value: input.type === 'number' ? 0 : input.type === 'checkbox' ? false : '',
    ...(input.type === 'select' && input.options ? { options: input.options } : {}),
  };
  const now = new Date().toISOString();
  return {
    ...sheet,
    fields: [...sheet.fields, field],
    updatedAt: now,
  };
}

export function removeCustomField(sheet: CharacterSheet, key: string): CharacterSheet {
  const now = new Date().toISOString();
  return {
    ...sheet,
    fields: sheet.fields.filter((field) => field.key !== key),
    updatedAt: now,
  };
}

export function updateCustomFieldLabel(
  sheet: CharacterSheet,
  key: string,
  label: string,
): CharacterSheet {
  const now = new Date().toISOString();
  return {
    ...sheet,
    fields: sheet.fields.map((field) =>
      field.key === key ? { ...field, label: label.trim() || field.label } : field,
    ),
    updatedAt: now,
  };
}

export function cloneCharacterSheet(sheet: CharacterSheet): CharacterSheet {
  const now = new Date().toISOString();
  return {
    ...sheet,
    id: crypto.randomUUID(),
    name: `${sheet.name} (copy)`,
    lineageSheetId: sheet.id,
    createdAt: now,
    updatedAt: now,
  };
}

export function getHiddenFieldKeys(sheet: CharacterSheet): Set<string> {
  return new Set(sheet.layout?.hiddenFieldKeys ?? []);
}

export function isFieldHidden(sheet: CharacterSheet, key: string): boolean {
  return getHiddenFieldKeys(sheet).has(key);
}

export function setFieldHidden(sheet: CharacterSheet, key: string, hidden: boolean): CharacterSheet {
  const hiddenKeys = new Set(sheet.layout?.hiddenFieldKeys ?? []);
  if (hidden) {
    hiddenKeys.add(key);
  } else {
    hiddenKeys.delete(key);
  }
  const now = new Date().toISOString();
  return {
    ...sheet,
    layout: {
      hiddenFieldKeys: [...hiddenKeys],
      ...(sheet.layout?.fieldLabels ? { fieldLabels: sheet.layout.fieldLabels } : {}),
    },
    updatedAt: now,
  };
}

export const FIELD_PALETTE_TEMPLATES = [
  { label: 'Short text', type: 'text' as const },
  { label: 'Long text', type: 'textarea' as const },
  { label: 'Number', type: 'number' as const },
  { label: 'Flag', type: 'checkbox' as const },
] as const;
