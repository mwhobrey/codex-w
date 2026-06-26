'use client';

import type { RollResult } from '@codex/game-engine';
import { Button, Card, CardContent, Input, Label } from '@codex/ui';
import type { DiceFormula, DiceSet } from '@codex/schemas';
import { diceSetRepo } from '@codex/sync';
import { useState } from 'react';
import { queueDiceSetSync } from '@/lib/dice-set-sync';
import { useDiceRoll, type DicePreset } from '@/hooks/use-dice-roll';
import { DieFace } from './die-face';
import { RollLog } from './roll-log';

interface DiceRollerProps {
  presets?: DicePreset[];
  activeSetName?: string;
  onRoll?: (result: RollResult) => void;
}

export function DiceRoller({ presets, activeSetName, onRoll }: DiceRollerProps) {
  const { notation, setNotation, rolling, error, result, history, liveRef, roll, defaultPresets } =
    useDiceRoll('d20', onRoll);
  const quickPresets = presets?.length ? presets : defaultPresets;

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      roll();
    }
  };

  const displayDice = result?.groups.flatMap((group) => group.rolls) ?? [];

  return (
    <div className="mx-auto max-w-2xl">
      {activeSetName && (
        <p className="mb-3 text-center text-xs text-muted-foreground">
          Using set: <span className="font-medium text-foreground">{activeSetName}</span>
        </p>
      )}
      <Card className="shadow-xl shadow-black/20">
        <CardContent className="pt-6">
          <Label htmlFor="dice-notation">Dice notation</Label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <Input
              id="dice-notation"
              value={notation}
              onChange={(e) => setNotation(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoComplete="off"
              className="font-mono text-lg"
              aria-describedby={error ? 'dice-error' : 'dice-hint'}
            />
            <Button
              type="button"
              onClick={() => roll()}
              disabled={rolling}
              className="shrink-0"
              data-testid="dice-roll-button"
            >
              {rolling ? 'Rolling…' : 'Roll'}
            </Button>
          </div>

          <p id="dice-hint" className="mt-2 text-xs text-muted-foreground">
            Supports 2d6+3, 4d6kh3, d20adv, d%, 4dF — press Enter to roll
          </p>
          {error && (
            <p id="dice-error" role="alert" className="mt-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {quickPresets.map((preset) => (
              <Button
                key={`${preset.label}-${preset.notation}`}
                type="button"
                variant={notation === preset.notation ? 'default' : 'outline'}
                size="sm"
                className="font-mono"
                onClick={() => {
                  setNotation(preset.notation);
                  roll(preset.notation);
                }}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div
        className="mt-8 min-h-[180px] rounded-2xl border border-border bg-secondary/30 p-6 sm:p-8"
        aria-live="polite"
        aria-atomic="true"
        ref={liveRef}
        tabIndex={-1}
        data-testid="dice-roll-result"
      >
        {rolling && (
          <div className="flex flex-wrap justify-center gap-4">
            {Array.from({ length: Math.min(4, notation.includes('d') ? 2 : 1) }).map((_, i) => (
              <DieFace key={i} value={null} sides={20} rolling />
            ))}
          </div>
        )}

        {!rolling && result && (
          <div className="text-center">
            <div className="flex flex-wrap justify-center gap-3">
              {displayDice.map((die, index) => (
                <DieFace
                  key={`${result.rolledAt}-${index}`}
                  value={die.value}
                  sides={die.sides}
                  dropped={!die.kept}
                />
              ))}
            </div>

            <p
              className="mt-6 font-display text-5xl font-medium tabular-nums text-primary sm:text-6xl"
              data-testid="dice-roll-total"
            >
              {result.total}
            </p>
            {result.modifierTotal !== 0 && (
              <p className="mt-1 text-sm text-muted-foreground">
                Includes {result.modifierTotal > 0 ? '+' : ''}
                {result.modifierTotal} modifier
              </p>
            )}
          </div>
        )}

        {!rolling && !result && (
          <p className="text-center text-muted-foreground">Roll to see your fate.</p>
        )}
      </div>

      <RollLog entries={history} />
    </div>
  );
}
