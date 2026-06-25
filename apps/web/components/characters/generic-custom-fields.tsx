'use client';

import type { CharacterSheet } from '@codex/schemas';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Select } from '@codex/ui';
import { useState } from 'react';
import {
  addCustomField,
  removeCustomField,
  updateCustomFieldLabel,
} from '@/lib/generic-sheet-builder';
import { SheetFieldInput } from './sheet-fields';

interface GenericCustomFieldsProps {
  fields: CharacterSheet['fields'];
  onChange: (next: CharacterSheet) => void;
  sheet: CharacterSheet;
}

export function GenericCustomFields({ fields, onChange, sheet }: GenericCustomFieldsProps) {
  const [label, setLabel] = useState('');
  const [type, setType] = useState<'text' | 'textarea' | 'number' | 'select' | 'checkbox'>('text');

  if (fields.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="font-display text-xl">Custom fields</CardTitle>
          <CardDescription>
            Add any field your table needs — labels, stats, flags. We keep them when you adapt to
            other systems.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddFieldForm
            label={label}
            type={type}
            onLabelChange={setLabel}
            onTypeChange={setType}
            onAdd={() => {
              const next = addCustomField(sheet, { label, type });
              onChange(next);
              setLabel('');
            }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl">Custom fields</CardTitle>
        <CardDescription>Extra data for your game — not locked to our default layout.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-4">
          {fields.map((field) => (
            <li key={field.key} className="rounded-lg border border-border p-4">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <Label htmlFor={`${field.key}-label`} className="mb-1.5 block text-xs uppercase">
                    Label
                  </Label>
                  <Input
                    id={`${field.key}-label`}
                    value={field.label}
                    onChange={(e) =>
                      onChange(updateCustomFieldLabel(sheet, field.key, e.target.value))
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onChange(removeCustomField(sheet, field.key))}
                >
                  Remove
                </Button>
              </div>
              <SheetFieldInput
                definition={{
                  key: field.key,
                  label: field.label,
                  type: field.type,
                  defaultValue: field.type === 'number' ? 0 : '',
                }}
                field={field}
                onChange={(key, value) => {
                  const now = new Date().toISOString();
                  onChange({
                    ...sheet,
                    updatedAt: now,
                    fields: sheet.fields.map((f) => (f.key === key ? { ...f, value } : f)),
                  });
                }}
              />
            </li>
          ))}
        </ul>
        <AddFieldForm
          label={label}
          type={type}
          onLabelChange={setLabel}
          onTypeChange={setType}
          onAdd={() => {
            const next = addCustomField(sheet, { label, type });
            onChange(next);
            setLabel('');
          }}
        />
      </CardContent>
    </Card>
  );
}

function AddFieldForm({
  label,
  type,
  onLabelChange,
  onTypeChange,
  onAdd,
}: {
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox';
  onLabelChange: (value: string) => void;
  onTypeChange: (value: 'text' | 'textarea' | 'number' | 'select' | 'checkbox') => void;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Label htmlFor="new-custom-label" className="mb-1.5 block text-xs uppercase">
          New field
        </Label>
        <Input
          id="new-custom-label"
          value={label}
          onChange={(e) => onLabelChange(e.target.value)}
          placeholder="e.g. Reputation, Curse, Ship name"
        />
      </div>
      <div className="w-full sm:w-36">
        <Label htmlFor="new-custom-type" className="mb-1.5 block text-xs uppercase">
          Type
        </Label>
        <Select id="new-custom-type" value={type} onChange={(e) => onTypeChange(e.target.value as typeof type)}>
          <option value="text">Text</option>
          <option value="textarea">Long text</option>
          <option value="number">Number</option>
          <option value="checkbox">Flag</option>
        </Select>
      </div>
      <Button type="button" variant="secondary" onClick={onAdd} disabled={!label.trim()}>
        Add field
      </Button>
    </div>
  );
}
