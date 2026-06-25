'use client';

import { parseDiceNotation } from '@codex/game-engine';
import { DiceParseError } from '@codex/game-engine';
import type { DiceFormula, DiceSet } from '@codex/schemas';
import { diceSetRepo } from '@codex/sync';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@codex/ui';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { queueDiceSetSync } from '@/lib/dice-set-sync';
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

  const selectedSet =
    sets?.find((s) => s.id === selectedSetId) ?? (sets && sets.length > 0 ? sets[0] : null);

  const presets = selectedSet?.formulas.map((f) => ({ label: f.label, notation: f.notation }));

  const handleCreateSet = async () => {
    const created = createEmptyDiceSet(ownerId, 'My dice set');
    await diceSetRepo.save(created);
    void queueDiceSetSync(created);
    setSelectedSetId(created.id);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      {roomId ? (
        <Card className="border-codex-ember/30 bg-codex-ember/5">
          <CardContent className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-left text-sm">
              <p className="font-medium text-codex-text">
                Logging rolls to play room
                <span className="ml-2 font-mono text-xs text-codex-text-muted">{roomId}</span>
              </p>
              <p className="mt-1 text-xs text-codex-text-muted">
                {logReady
                  ? connected
                    ? 'Synced live with the room.'
                    : 'Saved locally — will sync when PartyKit is online.'
                  : 'Connecting to room log…'}
              </p>
              {lastPushed ? (
                <p className="mt-1 text-xs text-codex-ember" aria-live="polite">
                  Last pushed: {lastPushed}
                </p>
              ) : null}
            </div>
            <Button type="button" variant="outline" size="sm" asChild>
              <Link href={`/play/${roomId}`}>Back to room</Link>
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
              No custom sets yet. Create one to save your go-to formulas for play rooms and solo.
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
