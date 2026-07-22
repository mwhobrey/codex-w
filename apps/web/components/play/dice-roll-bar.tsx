'use client';

import type { RollResult } from '@codex/game-engine';
import type { DicePreset } from '@codex/game-systems';
import { Button, Input, cn } from '@codex/ui';
import Link from 'next/link';
import { useMemo } from 'react';
import { DieFace } from '@/components/dice/die-face';
import { useDiceRoll } from '@/hooks/use-dice-roll';
import { useDiceSets } from '@/hooks/use-dice-sets';
import { buildDiceHubPath } from '@/lib/play-room';

interface DiceRollBarProps {
  onRoll: (result: RollResult) => void;
  systemPresets?: DicePreset[];
  roomId?: string;
  inviteToken?: string;
  className?: string;
}

/**
 * Compact, always-visible roll strip that lives at the top of the session
 * stream — rolling and reading the result happen in the same view as the
 * log, instead of behind a separate Dice tab.
 */
export function DiceRollBar({
  onRoll,
  systemPresets = [],
  roomId,
  inviteToken,
  className,
}: DiceRollBarProps) {
  const { sets } = useDiceSets();
  const { notation, setNotation, rolling, error, result, roll, defaultPresets } = useDiceRoll(
    'd20',
    onRoll,
  );

  const presets = useMemo(() => {
    if (systemPresets.length > 0) return systemPresets.slice(0, 5);
    const first = sets?.[0];
    if (first?.formulas?.length) {
      return first.formulas.slice(0, 5).map((f) => ({ label: f.label, notation: f.notation }));
    }
    return defaultPresets.slice(0, 5);
  }, [defaultPresets, sets, systemPresets]);

  const displayDice = result?.groups.flatMap((group) => group.rolls) ?? [];

  return (
    <div
      className={cn('rounded-lg border border-border/40 bg-background/40 p-2.5', className)}
      data-testid="dice-roll-bar"
    >
      <div className="flex gap-2">
        <Input
          value={notation}
          onChange={(event) => setNotation(event.target.value)}
          className="h-8 font-mono text-sm"
          spellCheck={false}
          placeholder="e.g. 2d6+3"
          aria-label="Dice notation"
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
          className="h-8 shrink-0 px-3"
          onClick={() => roll()}
          disabled={rolling}
          data-testid="dice-roll-bar-roll"
        >
          {rolling ? '…' : 'Roll'}
        </Button>
        {rolling || result ? (
          <div className="flex shrink-0 items-center gap-1.5 pl-1" aria-live="polite">
            {rolling ? (
              <DieFace value={null} sides={20} rolling size="sm" />
            ) : (
              <>
                <div className="flex gap-0.5">
                  {displayDice.slice(0, 3).map((die, index) => (
                    <DieFace
                      key={`${result!.rolledAt}-${index}`}
                      value={die.value}
                      sides={die.sides}
                      dropped={!die.kept}
                      size="sm"
                    />
                  ))}
                </div>
                <span className="font-display text-lg font-medium tabular-nums text-primary">
                  {result!.total}
                </span>
              </>
            )}
          </div>
        ) : null}
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        {presets.map((preset) => (
          <Button
            key={`${preset.label}-${preset.notation}`}
            type="button"
            variant="outline"
            size="sm"
            className="h-6 font-mono text-xs"
            onClick={() => roll(preset.notation)}
          >
            {preset.label}
          </Button>
        ))}
        <Link
          href={roomId ? buildDiceHubPath(roomId, inviteToken) : '/dice'}
          className="ml-auto shrink-0 text-xs text-muted-foreground hover:text-primary"
          data-testid="dice-roll-bar-manage"
        >
          Manage sets →
        </Link>
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
