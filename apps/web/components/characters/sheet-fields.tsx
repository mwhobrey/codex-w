'use client';

import type { CharacterSheetField } from '@codex/schemas';
import type { SheetFieldDefinition, SheetSectionDefinition } from '@codex/game-systems';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  Select,
  Textarea,
} from '@codex/ui';
import { getFieldDisplayLabel } from '@/lib/generic-sheet-utils';
import { coerceListValue } from '@/lib/generic-sheet-utils';
import type { CharacterSheet } from '@codex/schemas';
import { GearListField } from './gear-list-field';

type FieldValue = string | number | boolean | string[];

interface SheetFieldProps {
  definition: SheetFieldDefinition;
  field: CharacterSheetField;
  sheet?: CharacterSheet;
  onChange: (key: string, value: FieldValue) => void;
  editableLabel?: boolean;
  onLabelChange?: (key: string, label: string) => void;
}

export function SheetFieldInput({
  definition,
  field,
  sheet,
  onChange,
  editableLabel,
  onLabelChange,
}: SheetFieldProps) {
  const displayLabel = sheet ? getFieldDisplayLabel(sheet, field) : field.label;

  if (field.type === 'list') {
    return (
      <GearListField
        id={field.key}
        items={coerceListValue(field.value)}
        placeholder={definition.placeholder}
        onChange={(items) => onChange(field.key, items)}
      />
    );
  }

  if (field.type === 'textarea') {
    return (
      <Textarea
        id={field.key}
        value={String(field.value)}
        onChange={(e) => onChange(field.key, e.target.value)}
        placeholder={definition.placeholder}
        rows={4}
      />
    );
  }

  if (field.type === 'number') {
    return (
      <Input
        id={field.key}
        type="number"
        value={typeof field.value === 'number' ? field.value : 0}
        onChange={(e) => onChange(field.key, Number(e.target.value))}
        className="font-mono tabular-nums"
      />
    );
  }

  if (field.type === 'checkbox') {
    return (
      <Checkbox
        id={field.key}
        checked={Boolean(field.value)}
        onChange={(e) => onChange(field.key, e.target.checked)}
      />
    );
  }

  if (field.type === 'select' && field.options) {
    return (
      <Select
        id={field.key}
        value={String(field.value)}
        onChange={(e) => onChange(field.key, e.target.value)}
      >
        {field.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
    );
  }

  return (
    <Input
      id={field.key}
      type="text"
      value={String(field.value)}
      onChange={(e) => onChange(field.key, e.target.value)}
      placeholder={definition.placeholder}
      className={field.key === 'given_name' ? 'font-display text-lg' : undefined}
      aria-label={editableLabel ? displayLabel : undefined}
    />
  );
}

interface SheetSectionProps {
  section: SheetSectionDefinition;
  fields: CharacterSheetField[];
  sheet?: CharacterSheet;
  onChange: (key: string, value: FieldValue) => void;
  hiddenKeys?: Set<string>;
  onToggleField?: (key: string, visible: boolean) => void;
  editableLayout?: boolean;
  relabelable?: boolean;
  onLabelChange?: (key: string, label: string) => void;
}

export function SheetSection({
  section,
  fields,
  sheet,
  onChange,
  hiddenKeys,
  onToggleField,
  editableLayout,
  relabelable,
  onLabelChange,
}: SheetSectionProps) {
  const fieldMap = new Map(fields.map((field) => [field.key, field]));
  const visibleFields = section.fields.filter((definition) => !hiddenKeys?.has(definition.key));

  if (visibleFields.length === 0 && !editableLayout) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl">{section.title}</CardTitle>
        {section.description && <CardDescription>{section.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {visibleFields.length === 0 ? (
          <p className="text-sm text-muted-foreground">All fields in this section are hidden.</p>
        ) : (
          <div
            className={`grid gap-5 ${
              section.id === 'attributes' || section.id === 'vitals'
                ? 'grid-cols-2 sm:grid-cols-3'
                : 'grid-cols-1'
            }`}
          >
            {visibleFields.map((definition) => {
              const field = fieldMap.get(definition.key);
              if (!field) return null;
              const displayLabel = sheet ? getFieldDisplayLabel(sheet, field) : field.label;
              const canRelabel =
                relabelable &&
                onLabelChange &&
                (section.id === 'attributes' || section.id === 'vitals');

              return (
                <div
                  key={definition.key}
                  className={
                    definition.type === 'textarea' || definition.type === 'list'
                      ? 'col-span-full'
                      : undefined
                  }
                >
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    {canRelabel ? (
                      <Input
                        value={displayLabel}
                        onChange={(e) => onLabelChange(definition.key, e.target.value)}
                        className="h-8 max-w-[10rem] text-sm font-medium"
                        aria-label={`Label for ${definition.key}`}
                      />
                    ) : (
                      <Label htmlFor={definition.key}>{displayLabel}</Label>
                    )}
                    {editableLayout && onToggleField && (
                      <button
                        type="button"
                        className="text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => onToggleField(definition.key, false)}
                      >
                        Hide
                      </button>
                    )}
                  </div>
                  <SheetFieldInput
                    definition={definition}
                    field={field}
                    sheet={sheet}
                    onChange={onChange}
                  />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
