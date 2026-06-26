'use client';

import type { RollResult } from '@codex/game-engine';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@codex/ui';
import Link from 'next/link';
import { useMemo } from 'react';
import type { DicePreset } from '@codex/game-systems';
import { useDiceRoll } from '@/hooks/use-dice-roll';
import { useDiceSets } from '@/hooks/use-dice-sets';
import { DieFace } from '@/components/dice/die-face';

interface PlayDicePanelProps {
  onRoll: (result: RollResult) => void;
  className?: string;
  systemPresets?: DicePreset[];
  roomId?: string;
}

export function PlayDicePanel({ onRoll, className, systemPresets = [], roomId }: PlayDicePanelProps) {
  const { sets } = useDiceSets();
  const { notation, setNotation, rolling, error, result, roll, defaultPresets } = useDiceRoll(
    'd20',
    onRoll,
  );

  const presets = useMemo(() => {
    if (systemPresets.length > 0) return systemPresets;
    const first = sets?.[0];
    if (first?.formulas?.length) {
      return first.formulas.map((f) => ({ label: f.label, notation: f.notation }));
    }
    return [...defaultPresets];
  }, [defaultPresets, sets, systemPresets]);

  const displayDice = result?.groups.flatMap((group) => group.rolls) ?? [];

  return (
    <Card
      className={className}
      data-testid="play-dice-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Dice</CardTitle>
        <p className="text-xs text-muted-foreground">Rolls post to the session log automatically.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label htmlFor="play-dice-notation" className="sr-only">
            Dice notation
          </Label>
          <div className="flex gap-2">
            <Input
              id="play-dice-notation"
              value={notation}
              onChange={(event) => setNotation(event.target.value)}
              className="font-mono"
              spellCheck={false}
              placeholder="e.g. 2d6+3"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  roll();
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              className="shrink-0 px-4"
              onClick={() => roll()}
              disabled={rolling}
              data-testid="play-dice-roll"
            >
              {rolling ? '…' : 'Roll'}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
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
          <p className="text-xs text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="rounded-lg border border-border/40 bg-background/40 p-4" aria-live="polite">
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
              <p className="mt-2 font-display text-4xl font-medium tabular-nums text-primary">
                {result.total}
              </p>
            </div>
          ) : (
            <p className="text-center text-xs text-muted-foreground">Your last roll shows here.</p>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          <Link
            href={roomId ? `/dice?room=${encodeURIComponent(roomId)}` : '/dice'}
            className="hover:text-primary"
          >
            Manage dice sets →
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
