'use client';

import {
  adaptSheetWithMappings,
  listTargetFieldOptions,
  moveSheetWithMappings,
  proposeFieldMappings,
  type FieldAdaptMapping,
} from '@codex/game-systems';
import type { CharacterSheet, GameSystemId } from '@codex/schemas';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Select } from '@codex/ui';
import { useMemo, useState } from 'react';

export type AdaptMode = 'copy' | 'move';

interface CharacterAdaptDialogProps {
  source: CharacterSheet;
  targetId: GameSystemId;
  targetName: string;
  createEmpty: (name: string, ownerId: string) => CharacterSheet;
  onCancel: () => void;
  onConfirm: (result: { mode: AdaptMode; sheets: CharacterSheet[] }) => void;
}

export function CharacterAdaptDialog({
  source,
  targetId,
  targetName,
  createEmpty,
  onCancel,
  onConfirm,
}: CharacterAdaptDialogProps) {
  const targetOptions = useMemo(() => listTargetFieldOptions(createEmpty), [createEmpty]);

  const [mappings, setMappings] = useState<FieldAdaptMapping[]>(() =>
    proposeFieldMappings(source, targetId, createEmpty),
  );
  const [mode, setMode] = useState<AdaptMode>('copy');

  const updateMapping = (sourceKey: string, targetKey: string) => {
    setMappings((prev) =>
      prev.map((row) =>
        row.sourceKey === sourceKey
          ? { ...row, targetKey: targetKey === 'skip' ? 'skip' : targetKey }
          : row,
      ),
    );
  };

  const handleConfirm = () => {
    if (mode === 'move') {
      const { archive, moved } = moveSheetWithMappings(source, createEmpty, targetId, mappings);
      onConfirm({ mode, sheets: [archive, moved] });
      return;
    }
    const adapted = adaptSheetWithMappings(source, createEmpty, targetId, mappings);
    onConfirm({ mode, sheets: [adapted] });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="adapt-dialog-title"
    >
      <Card className="max-h-[85vh] w-full max-w-2xl overflow-hidden shadow-2xl">
        <CardHeader>
          <CardTitle id="adapt-dialog-title" className="font-display text-xl">
            Adapt to {targetName}
          </CardTitle>
          <CardDescription>
            Map fields, then choose whether to copy or move this character.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex max-h-[50vh] flex-col gap-4 overflow-y-auto">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant={mode === 'copy' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('copy')}
            >
              Copy to new sheet
            </Button>
            <Button
              type="button"
              variant={mode === 'move' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('move')}
            >
              Move this character
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {mode === 'copy'
              ? 'Keeps the original sheet. You get a new adapted copy with lineage back to this one.'
              : 'Replaces this sheet in place. We archive the current version so you can walk it back.'}
          </p>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="pb-2 pr-3 font-medium">Source field</th>
                <th className="pb-2 pr-3 font-medium">Value</th>
                <th className="pb-2 font-medium">Target field</th>
              </tr>
            </thead>
            <tbody>
              {mappings.map((row) => (
                <tr key={row.sourceKey} className="border-b border-border/50 align-top">
                  <td className="py-3 pr-3 font-medium">{row.sourceLabel}</td>
                  <td className="max-w-[140px] truncate py-3 pr-3 text-muted-foreground sm:max-w-xs">
                    {row.sourceValue || <span className="italic">empty</span>}
                  </td>
                  <td className="py-3">
                    <Select
                      value={row.targetKey}
                      onChange={(e) => updateMapping(row.sourceKey, e.target.value)}
                      className="w-full min-w-[140px]"
                      aria-label={`Map ${row.sourceLabel}`}
                    >
                      <option value="skip">Skip</option>
                      {targetOptions.map((opt) => (
                        <option key={opt.key} value={opt.key}>
                          {opt.label}
                        </option>
                      ))}
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
        <div className="flex flex-col-reverse gap-2 border-t border-border p-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm}>
            {mode === 'copy' ? 'Create adapted copy' : 'Move character'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
