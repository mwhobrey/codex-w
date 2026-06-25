'use client';

import type { RollResult } from '@codex/game-engine';
import { Button, Input, Label } from '@codex/ui';
import { useMemo } from 'react';
import { useDiceRoll } from '@/hooks/use-dice-roll';
import { useDiceSets } from '@/hooks/use-dice-sets';
import { DieFace } from '@/components/dice/die-face';

interface PlayDicePanelProps {
  onRoll: (result: RollResult) => void;
  className?: string;
}

export function PlayDicePanel({ onRoll, className }: PlayDicePanelProps) {
  const { sets } = useDiceSets();
  const { notation, setNotation, rolling, error, result, roll, defaultPresets } = useDiceRoll(
    'd20',
    onRoll,
  );

  const presets = useMemo(() => {
    const first = sets?.[0];
    if (first?.formulas?.length) {
      return first.formulas.map((f) => ({ label: f.label, notation: f.notation }));
    }
    return [...defaultPresets];
  }, [sets, defaultPresets]);

  const displayDice = result?.groups.flatMap((group) => group.rolls) ?? [];

  return (
    <div className={className} data-testid="play-dice-panel">
      <Label htmlFor="play-dice-notation" className="text-xs">
        Dice
      </Label>
      <div className="mt-1 flex gap-2">
        <Input
          id="play-dice-notation"
          value={notation}
          onChange={(event) => setNotation(event.target.value)}
          className="font-mono"
          spellCheck={false}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              roll();
            }
          }}
        />
        <Button type="button" size="sm" onClick={() => roll()} disabled={rolling} data-testid="play-dice-roll">
          {rolling ? '…' : 'Roll'}
        </Button>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {presets.map((preset) => (
          <Button
            key={`${preset.label}-${preset.notation}`}
            type="button"
            variant="outline"
            size="sm"
            className="h-8 font-mono text-xs"
            onClick={() => roll(preset.notation)}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {error ? (
        <p className="mt-2 text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-3 rounded-lg border border-codex-border/40 bg-codex-void/40 p-3" aria-live="polite">
        {rolling ? (
          <div className="flex justify-center gap-2">
            <DieFace value={null} sides={20} rolling />
          </div>
        ) : result ? (
          <div className="text-center">
            <div className="flex flex-wrap justify-center gap-1.5">
              {displayDice.slice(0, 8).map((die, index) => (
                <DieFace
                  key={`${result.rolledAt}-${index}`}
                  value={die.value}
                  sides={die.sides}
                  dropped={!die.kept}
                />
              ))}
            </div>
            <p className="mt-2 font-display text-3xl font-medium tabular-nums text-codex-ember">
              {result.total}
            </p>
          </div>
        ) : (
          <p className="text-center text-xs text-codex-text-muted">Rolls log to the table.</p>
        )}
      </div>
    </div>
  );
}
