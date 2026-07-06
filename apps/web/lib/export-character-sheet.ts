import { getGameSystem } from '@codex/game-systems';
import { GameSystemIdSchema, type CharacterSheet, type CharacterSheetField } from '@codex/schemas';
import { getCustomFields, listDefinitionKeys } from './generic-sheet-builder';

function formatFieldValue(field: CharacterSheetField): string | null {
  const { value } = field;
  if (value === undefined || value === null || value === '') return null;
  if (Array.isArray(value)) return value.length ? value.join(', ') : null;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

/** Renders a character sheet as portable Markdown — for backup, printing, or sharing outside the app. */
export function exportCharacterSheetMarkdown(sheet: CharacterSheet): string {
  const plugin = getGameSystem(GameSystemIdSchema.parse(sheet.gameSystemId));
  const fieldsByKey = new Map(sheet.fields.map((field) => [field.key, field]));
  const hidden = new Set(sheet.layout?.hiddenFieldKeys ?? []);
  const lines = [`# ${sheet.name}`, '', `_${plugin.name}_`, ''];

  for (const section of plugin.sheetDefinition.sections) {
    const rows: string[] = [];
    for (const fieldDef of section.fields) {
      if (hidden.has(fieldDef.key)) continue;
      const field = fieldsByKey.get(fieldDef.key);
      const display = field ? formatFieldValue(field) : null;
      if (display === null) continue;
      const label = sheet.layout?.fieldLabels?.[fieldDef.key] ?? fieldDef.label;
      rows.push(`**${label}:** ${display}`);
    }
    if (rows.length === 0) continue;
    lines.push(`## ${section.title}`, '', ...rows.flatMap((row) => [row, '']));
  }

  const definitionKeys = listDefinitionKeys(plugin.sheetDefinition.sections.flatMap((s) => s.fields));
  const customFields = getCustomFields(sheet, definitionKeys).filter((field) => !hidden.has(field.key));
  const customRows = customFields
    .map((field) => {
      const display = formatFieldValue(field);
      return display === null ? null : `**${field.label}:** ${display}`;
    })
    .filter((row): row is string => row !== null);

  if (customRows.length > 0) {
    lines.push('## Custom fields', '', ...customRows.flatMap((row) => [row, '']));
  }

  return lines.join('\n').trimEnd() + '\n';
}

/** Trigger a browser download for the given text content. */
export function downloadTextFile(filename: string, content: string, mimeType = 'text/markdown'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
