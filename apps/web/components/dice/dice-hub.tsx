'use client';

import { parseDiceNotation } from '@codex/game-engine';
import { DiceParseError } from '@codex/game-engine';
import type { DiceFormula, DiceSet } from '@codex/schemas';
import { diceSetRepo } from '@codex/sync';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@codex/ui';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { createPlayRoomUrl } from '@/lib/play-room';
import { queueDiceSetSync } from '@/lib/dice-set-sync';
import { resolvePlayRoomInvite } from '@/lib/resolve-table-invite';
import { createDiceSetFromTemplate, listSystemDiceSetTemplates } from '@/lib/system-dice-sets';
import { createEmptyDiceSet, useDiceSets } from '@/hooks/use-dice-sets';
import { usePlayRoomLogPush } from '@/hooks/use-play-room-log-push';
import { DiceRoller } from './dice-roller';

function FormulaRow({
  formula,
  onChange,
  onRemove,
}: {
  formula: DiceFormula;
  onChange: (next: DiceFormula) => void;
  onRemove: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  const validate = (notation: string) => {
    try {
      parseDiceNotation(notation);
      setError(null);
      return true;
    } catch (err) {
      setError(err instanceof DiceParseError ? err.message : 'Invalid');
      return false;
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-start">
      <div className="flex-1 space-y-2">
        <Input
          value={formula.label}
          onChange={(e) => onChange({ ...formula, label: e.target.value })}
          placeholder="Label"
          aria-label="Formula label"
        />
        <Input
          value={formula.notation}
          onChange={(e) => {
            const notation = e.target.value;
            onChange({ ...formula, notation });
            if (notation.trim()) validate(notation);
          }}
          placeholder="d20+5"
          className="font-mono"
          spellCheck={false}
          aria-label="Formula notation"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={onRemove}>
        Remove
      </Button>
    </div>
  );
}

function DiceSetEditor({
  set,
  selected,
  onSelect,
  onSaved,
  onDeleted,
}: {
  set: DiceSet;
  selected: boolean;
  onSelect: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const [draft, setDraft] = useState<DiceSet>(set);
  const [saving, setSaving] = useState(false);

  const persist = async (next: DiceSet) => {
    setSaving(true);
    const updated = { ...next, updatedAt: new Date().toISOString() };
    setDraft(updated);
    await diceSetRepo.save(updated);
    void queueDiceSetSync(updated);
    setSaving(false);
    onSaved();
  };

  return (
    <Card className={selected ? 'ring-2 ring-primary/40' : undefined}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
        <div className="min-w-0 flex-1">
          <Label htmlFor={`set-name-${set.id}`} className="sr-only">
            Set name
          </Label>
          <Input
            id={`set-name-${set.id}`}
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            onBlur={() => void persist(draft)}
            className="font-display text-lg"
          />
          <CardDescription className="mt-1">
            {draft.formulas.length} formula{draft.formulas.length === 1 ? '' : 's'}
            {saving && ' · saving…'}
          </CardDescription>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button type="button" variant={selected ? 'default' : 'outline'} size="sm" onClick={onSelect}>
            Use
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-destructive"
            onClick={async () => {
              if (!window.confirm(`Delete "${draft.name}"?`)) return;
              await diceSetRepo.delete(set.id);
              onDeleted();
            }}
          >
            Delete
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {draft.formulas.map((formula, index) => (
          <FormulaRow
            key={`${set.id}-${index}`}
            formula={formula}
            onChange={(next) => {
              const formulas = [...draft.formulas];
              formulas[index] = next;
              setDraft({ ...draft, formulas });
            }}
            onRemove={() => {
              if (draft.formulas.length <= 1) return;
              const formulas = draft.formulas.filter((_, i) => i !== index);
              void persist({ ...draft, formulas });
            }}
          />
        ))}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              const formulas = [...draft.formulas, { label: 'New roll', notation: 'd20' }];
              void persist({ ...draft, formulas });
            }}
          >
            Add formula
          </Button>
          <Button type="button" size="sm" onClick={() => void persist(draft)}>
            Save set
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function DiceHub() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get('room');
  const { sets, ownerId, ready } = useDiceSets();
  const { pushRoll, ready: logReady, connected } = usePlayRoomLogPush(roomId);
  const [lastPushed, setLastPushed] = useState<string | null>(null);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [addingTemplateId, setAddingTemplateId] = useState<string | null>(null);

  const systemTemplates = listSystemDiceSetTemplates();

  const selectedSet =
    sets?.find((s) => s.id === selectedSetId) ?? (sets && sets.length > 0 ? sets[0] : null);

  const presets = selectedSet?.formulas.map((f) => ({ label: f.label, notation: f.notation }));

  const handleCreateSet = async () => {
    const created = createEmptyDiceSet(ownerId, 'My dice set');
    await diceSetRepo.save(created);
    void queueDiceSetSync(created);
    setSelectedSetId(created.id);
  };

  const handleAddTemplate = async (templateId: string) => {
    const template = systemTemplates.find((item) => item.gameSystemId === templateId);
    if (!template || !ownerId) return;

    const exists = sets?.some(
      (set) => set.name === template.name && set.formulas.length === template.formulas.length,
    );
    if (exists) {
      const match = sets?.find((set) => set.name === template.name);
      if (match) setSelectedSetId(match.id);
      return;
    }

    setAddingTemplateId(templateId);
    const created = createDiceSetFromTemplate(ownerId, template);
    await diceSetRepo.save(created);
    void queueDiceSetSync(created);
    setSelectedSetId(created.id);
    setAddingTemplateId(null);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      {roomId ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-left text-sm">
              <p className="font-medium text-foreground">
                Logging rolls to play room
                <span className="ml-2 font-mono text-xs text-muted-foreground">{roomId}</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {logReady
                  ? connected
                    ? 'Synced live with the room.'
                    : 'Saved locally — will sync when PartyKit is online.'
                  : 'Connecting to room log…'}
              </p>
              {lastPushed ? (
                <p className="mt-1 text-xs text-primary" aria-live="polite">
                  Last pushed: {lastPushed}
                </p>
              ) : null}
            </div>
            <Button type="button" variant="outline" size="sm" asChild>
              <Link href={createPlayRoomUrl(roomId, undefined, resolvePlayRoomInvite(roomId))}>
                Back to room
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <DiceRoller
        presets={presets}
        activeSetName={selectedSet?.name}
        onRoll={
          roomId
            ? (result) => {
                pushRoll(result);
                setLastPushed(`${result.notation} → ${result.total}`);
              }
            : undefined
        }
      />

      <section aria-labelledby="dice-starter-sets-heading">
        <div className="mb-4">
          <h2 id="dice-starter-sets-heading" className="font-display text-2xl font-medium">
            Game dice sets
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            One-click shortcuts from each solo system&apos;s recommended rolls.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {systemTemplates.map((template) => (
            <Card key={template.gameSystemId} className="border-border/60 bg-card/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{template.name}</CardTitle>
                <CardDescription>
                  {template.formulas.map((formula) => formula.label).join(' · ')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={addingTemplateId === template.gameSystemId}
                  onClick={() => void handleAddTemplate(template.gameSystemId)}
                  data-testid={`dice-add-${template.gameSystemId}`}
                >
                  {addingTemplateId === template.gameSystemId ? 'Adding…' : 'Add set'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="dice-sets-heading">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="dice-sets-heading" className="font-display text-2xl font-medium">
              Dice sets
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Build formula shortcuts — saved locally, synced when you sign in.
            </p>
          </div>
          <Button type="button" onClick={() => void handleCreateSet()} data-testid="dice-new-set">
            New set
          </Button>
        </div>

        {!ready && <p className="text-sm text-muted-foreground">Loading your sets…</p>}

        {ready && (!sets || sets.length === 0) && (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No custom sets yet. Add a game set above or create your own formulas below.
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {sets?.map((set) => (
            <DiceSetEditor
              key={set.id}
              set={set}
              selected={selectedSet?.id === set.id}
              onSelect={() => setSelectedSetId(set.id)}
              onSaved={() => {}}
              onDeleted={() => {
                if (selectedSetId === set.id) setSelectedSetId(null);
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
