'use client';

import type { CharacterSheet } from '@codex/schemas';
import type { SheetFieldDefinition } from '@codex/game-systems';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@codex/ui';
import {
  FIELD_PALETTE_TEMPLATES,
  addCustomField,
  getHiddenFieldKeys,
  isFieldHidden,
  setFieldHidden,
} from '@/lib/generic-sheet-builder';

interface GenericFieldPaletteProps {
  sheet: CharacterSheet;
  definitions: SheetFieldDefinition[];
  onChange: (next: CharacterSheet) => void;
}

export function GenericFieldPalette({ sheet, definitions, onChange }: GenericFieldPaletteProps) {
  const hiddenKeys = getHiddenFieldKeys(sheet);
  const hiddenBuiltins = definitions.filter((def) => hiddenKeys.has(def.key));

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="font-display text-xl">Sheet builder</CardTitle>
        <CardDescription>
          Show or hide built-in fields, or add your own. Hidden fields keep their values — they
          just stay out of the way.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hiddenBuiltins.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Hidden fields
            </p>
            <div className="flex flex-wrap gap-2">
              {hiddenBuiltins.map((def) => (
                <Button
                  key={def.key}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onChange(setFieldHidden(sheet, def.key, false))}
                >
                  + {def.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Add custom field
          </p>
          <div className="flex flex-wrap gap-2">
            {FIELD_PALETTE_TEMPLATES.map((template) => (
              <Button
                key={template.label}
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  onChange(addCustomField(sheet, { label: template.label, type: template.type }));
                }}
              >
                {template.label}
              </Button>
            ))}
          </div>
        </div>

        <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Visible sheet fields
            </p>
          <ul className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {definitions
              .filter((def) => !isFieldHidden(sheet, def.key))
              .map((def) => (
                <li key={def.key}>
                  <span className="rounded-md border border-border px-2 py-1">{def.label}</span>
                </li>
              ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
