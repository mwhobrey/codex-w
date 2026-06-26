'use client';

import { DieFace } from '@/components/dice/die-face';
import { useDiceRoll } from '@/hooks/use-dice-roll';
import { useState } from 'react';

const HERO_DICE = [
  { label: 'd20', notation: 'd20', sides: 20 as const, size: 'sm' as const },
  { label: 'd6', notation: 'd6', sides: 6 as const, size: 'md' as const },
  { label: 'd10', notation: 'd10', sides: 10 as const, size: 'sm' as const },
] as const;

export function HeroDice() {
  const { rolling, result, roll } = useDiceRoll('d20');
  const [lastNotation, setLastNotation] = useState<string | null>(null);

  const displayDice = result?.groups.flatMap((group) => group.rolls) ?? [];

  return (
    <div className="relative mx-auto mt-16 flex flex-col items-center sm:mt-20">
      <div className="flex items-end gap-3 sm:gap-5">
        {HERO_DICE.map((die) => (
          <button
            key={die.notation}
            type="button"
            className="rounded-lg transition-transform motion-safe:hover:scale-105 motion-safe:active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Roll ${die.label}`}
            onClick={() => {
              setLastNotation(die.notation);
              roll(die.notation);
            }}
          >
            <DieFace
              value={
                rolling && lastNotation === die.notation
                  ? null
                  : result && lastNotation === die.notation
                    ? displayDice[0]?.value ?? null
                    : die.notation === 'd6'
                      ? 6
                      : die.notation === 'd20'
                        ? 20
                        : 10
              }
              sides={die.sides}
              size={die.size}
              rolling={rolling && lastNotation === die.notation}
            />
          </button>
        ))}
      </div>
      {result && lastNotation ? (
        <p className="mt-4 font-display text-2xl font-medium tabular-nums text-primary" aria-live="polite">
          {lastNotation} → {result.total}
        </p>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">Tap a die to roll</p>
      )}
    </div>
  );
}
