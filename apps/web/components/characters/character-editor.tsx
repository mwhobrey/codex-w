'use client';

import {
  getGameSystem,
  listAvailableSystems,
  updateSheetField,
} from '@codex/game-systems';
import { characterSheetRepo } from '@codex/sync';
import type { CharacterSheet, GameSystemId } from '@codex/schemas';
import { GameSystemIdSchema } from '@codex/schemas';
import { Badge, Button } from '@codex/ui';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { queueSheetSync } from '@/lib/sheet-sync';
import {
  cloneCharacterSheet,
  getCustomFields,
  getHiddenFieldKeys,
  listDefinitionKeys,
  setFieldHidden,
} from '@/lib/generic-sheet-builder';
import {
  normalizeListFields,
  syncGenericCharacterName,
  updateBuiltinFieldLabel,
} from '@/lib/generic-sheet-utils';
import { CharacterAdaptDialog } from './character-adapt-dialog';
import { GenericCustomFields } from './generic-custom-fields';
import { GenericFieldPalette } from './generic-field-palette';
import { SheetSection } from './sheet-fields';

interface CharacterEditorProps {
  sheetId: string;
}

export function CharacterEditor({ sheetId }: CharacterEditorProps) {
  const [sheet, setSheet] = useState<CharacterSheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [notFound, setNotFound] = useState(false);
  const [adapting, setAdapting] = useState(false);
  const [adaptTarget, setAdaptTarget] = useState<GameSystemId | null>(null);

  useEffect(() => {
    let active = true;
    characterSheetRepo.get(sheetId).then((loaded) => {
      if (!active) return;
      if (!loaded) {
        setNotFound(true);
      } else {
        const normalized =
          loaded.gameSystemId === 'generic' ? normalizeListFields(loaded) : loaded;
        setSheet(normalized);
        if (normalized !== loaded) {
          void characterSheetRepo.save(normalized);
        }
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [sheetId]);

  const persist = useCallback(async (next: CharacterSheet) => {
    setSheet(next);
    setSaveState('saving');
    await characterSheetRepo.save(next);
    void queueSheetSync(next);
    setSaveState('saved');
    window.setTimeout(() => setSaveState('idle'), 1500);
  }, []);

  const handleFieldChange = useCallback(
    (key: string, value: string | number | boolean | string[]) => {
      if (!sheet) return;
      if (sheet.gameSystemId === 'generic' && key === 'given_name' && typeof value === 'string') {
        void persist(syncGenericCharacterName(sheet, value));
        return;
      }
      void persist(updateSheetField(sheet, key, value));
    },
    [persist, sheet],
  );

  const handleDelete = useCallback(async () => {
    if (!sheet) return;
    if (!window.confirm(`Delete "${sheet.name}"? This cannot be undone.`)) return;
    await characterSheetRepo.delete(sheet.id);
    window.location.href = '/characters';
  }, [sheet]);

  const handleClone = useCallback(async () => {
    if (!sheet) return;
    const cloned = cloneCharacterSheet(sheet);
    await characterSheetRepo.save(cloned);
    void queueSheetSync(cloned);
    window.location.href = `/characters/${cloned.id}`;
  }, [sheet]);

  const handleAdaptConfirm = useCallback(
    async (result: { mode: 'copy' | 'move'; sheets: CharacterSheet[] }) => {
      setAdapting(true);
      try {
        for (const next of result.sheets) {
          await characterSheetRepo.save(next);
          void queueSheetSync(next);
        }
        const primary = result.sheets[result.sheets.length - 1]!;
        window.location.href = `/characters/${primary.id}`;
      } finally {
        setAdapting(false);
        setAdaptTarget(null);
      }
    },
    [],
  );

  const handleAdapt = useCallback((targetId: GameSystemId) => {
    setAdaptTarget(targetId);
  }, []);

  if (loading) {
    return <p className="text-center text-muted-foreground">Loading sheet…</p>;
  }

  if (notFound || !sheet) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Character not found.</p>
        <Link href="/characters" className="mt-4 inline-block text-primary hover:underline">
          ← Back to characters
        </Link>
      </div>
    );
  }

  const system = getGameSystem(GameSystemIdSchema.parse(sheet.gameSystemId));
  const isGeneric = sheet.gameSystemId === 'generic';
  const adaptTargets = listAvailableSystems().filter((s) => s.id !== sheet.gameSystemId);
  const definitionKeys = listDefinitionKeys(
    system.sheetDefinition.sections.flatMap((section) => section.fields),
  );
  const customFields = isGeneric ? getCustomFields(sheet, definitionKeys) : [];
  const hiddenKeys = isGeneric ? getHiddenFieldKeys(sheet) : undefined;
  const allDefinitions = system.sheetDefinition.sections.flatMap((s) => s.fields);
  const adaptTargetSystem = adaptTarget ? getGameSystem(adaptTarget) : null;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          {isGeneric ? (
            <>
              <h1 className="font-display text-3xl font-medium tracking-tight">
                {sheet.name === 'Unnamed character' ? 'New character' : sheet.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Character name lives in Identity below — the title updates as you type.
              </p>
            </>
          ) : (
            <h1 className="font-display text-3xl font-medium tracking-tight">{sheet.name}</h1>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge>{system.name}</Badge>
            {sheet.originSystemId && sheet.originSystemId !== sheet.gameSystemId && (
              <Badge variant="secondary">origin: {sheet.originSystemId}</Badge>
            )}
            {sheet.lineageSheetId && (
              <Link
                href={`/characters/${sheet.lineageSheetId}`}
                className="text-xs text-primary hover:underline"
              >
                ← previous version
              </Link>
            )}
            <span className="text-sm text-muted-foreground">
              saved locally
              {saveState === 'saving' && ' · saving…'}
              {saveState === 'saved' && ' · saved'}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleClone}>
            Clone
          </Button>
          <Button type="button" variant="destructive" size="sm" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      {adaptTargets.length > 0 && (
        <div className="mb-6 rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium text-foreground">Cross-play</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Copy or move into another system. Map fields first — skip anything you don&apos;t want
            to carry.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {adaptTargets.map((target) => (
              <Button
                key={target.id}
                type="button"
                variant="outline"
                size="sm"
                disabled={adapting}
                onClick={() => handleAdapt(target.id)}
              >
                Adapt to {target.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {adaptTarget && adaptTargetSystem && (
        <CharacterAdaptDialog
          source={sheet}
          targetId={adaptTarget}
          targetName={adaptTargetSystem.name}
          createEmpty={adaptTargetSystem.createEmptySheet}
          onCancel={() => setAdaptTarget(null)}
          onConfirm={(result) => void handleAdaptConfirm(result)}
        />
      )}

      <div className="space-y-6">
        {isGeneric && (
          <GenericFieldPalette
            sheet={sheet}
            definitions={allDefinitions}
            onChange={(next) => void persist(next)}
          />
        )}
        {system.sheetDefinition.sections.map((section) => (
          <SheetSection
            key={section.id}
            section={section}
            fields={sheet.fields}
            sheet={sheet}
            onChange={handleFieldChange}
            hiddenKeys={hiddenKeys}
            editableLayout={isGeneric}
            relabelable={isGeneric}
            onToggleField={(key, visible) =>
              void persist(setFieldHidden(sheet, key, !visible))
            }
            onLabelChange={(key, label) =>
              void persist(updateBuiltinFieldLabel(sheet, key, label))
            }
          />
        ))}
        {isGeneric && (
          <GenericCustomFields
            sheet={sheet}
            fields={customFields}
            onChange={(next) => void persist(next)}
          />
        )}
      </div>

      <p className="mt-10 text-center">
        <Link href="/characters" className="text-sm text-muted-foreground hover:text-primary">
          ← All characters
        </Link>
      </p>
    </div>
  );
}
