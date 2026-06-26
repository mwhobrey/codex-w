'use client';

import type { RollResult } from '@codex/game-engine';
import type { DicePreset } from '@codex/game-systems';
import { MAP_FLOATING_BOTTOM_CLASS } from '@/lib/map-overlay-layout';
import { Button, Input, cn } from '@codex/ui';
import { useMemo, useState } from 'react';
import { DieFace } from '@/components/dice/die-face';
import { useDiceRoll } from '@/hooks/use-dice-roll';
import { useDiceSets } from '@/hooks/use-dice-sets';

interface FloatingDiceWidgetProps {
  onRoll: (result: RollResult) => void;
  className?: string;
  systemPresets?: DicePreset[];
}

export function FloatingDiceWidget({ onRoll, className, systemPresets = [] }: FloatingDiceWidgetProps) {
  const [open, setOpen] = useState(false);
  const { sets } = useDiceSets();
  const { notation, setNotation, rolling, error, result, roll, defaultPresets } = useDiceRoll(
    'd20',
    onRoll,
  );

  const presets = useMemo(() => {
    if (systemPresets.length > 0) return systemPresets.slice(0, 4);
    const first = sets?.[0];
    if (first?.formulas?.length) {
      return first.formulas.slice(0, 4).map((f) => ({ label: f.label, notation: f.notation }));
    }
    return defaultPresets.slice(0, 4);
  }, [defaultPresets, sets, systemPresets]);

  const displayDice = result?.groups.flatMap((group) => group.rolls) ?? [];

  return (
    <div
      className={cn(
        'pointer-events-none absolute right-3 z-30 flex flex-col items-end gap-2',
        MAP_FLOATING_BOTTOM_CLASS,
        className,
      )}
      data-testid="floating-dice-widget"
    >
      {open ? (
        <div className="pointer-events-auto w-[min(100vw-2rem,280px)] rounded-xl border border-codex-border/60 bg-codex-surface/95 p-3 shadow-xl shadow-black/30 backdrop-blur-md">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-codex-text-muted">
              Quick roll
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded px-1.5 py-0.5 text-xs text-codex-text-muted hover:bg-codex-elevated/60 hover:text-codex-text"
              aria-label="Close dice"
            >
              ✕
            </button>
          </div>

          <div className="flex gap-2">
            <Input
              value={notation}
              onChange={(event) => setNotation(event.target.value)}
              className="h-9 font-mono text-sm"
              spellCheck={false}
              placeholder="d20"
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
              className="h-9 shrink-0 px-3"
              onClick={() => roll()}
              disabled={rolling}
              data-testid="floating-dice-roll"
            >
              {rolling ? '…' : 'Roll'}
            </Button>
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            {presets.map((preset) => (
              <Button
                key={`${preset.label}-${preset.notation}`}
                type="button"
                variant="outline"
                size="sm"
                className="h-7 font-mono text-[11px]"
                onClick={() => roll(preset.notation)}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {error ? (
            <p className="mt-2 text-[11px] text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <div className="mt-2 min-h-[52px] rounded-lg border border-codex-border/40 bg-codex-void/50 p-2" aria-live="polite">
            {rolling ? (
              <div className="flex justify-center">
                <DieFace value={null} sides={20} rolling size="sm" />
              </div>
            ) : result ? (
              <div className="flex items-center justify-center gap-2">
                <div className="flex gap-1">
                  {displayDice.slice(0, 4).map((die, index) => (
                    <DieFace
                      key={`${result.rolledAt}-${index}`}
                      value={die.value}
                      sides={die.sides}
                      dropped={!die.kept}
                      size="sm"
                    />
                  ))}
                </div>
                <span className="font-display text-2xl font-medium tabular-nums text-codex-ember">
                  {result.total}
                </span>
              </div>
            ) : (
              <p className="text-center text-[11px] text-codex-text-muted">Rolls log to the table.</p>
            )}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-codex-ember/40 bg-codex-surface/95 text-lg font-medium text-codex-ember shadow-lg shadow-black/25 backdrop-blur-md transition-transform hover:scale-105 active:scale-95',
          open && 'ring-2 ring-codex-ember/30',
        )}
        aria-expanded={open}
        aria-label={open ? 'Close quick dice' : 'Open quick dice'}
        data-testid="floating-dice-toggle"
      >
        {result && !open ? (
          <span className="font-display text-sm tabular-nums">{result.total}</span>
        ) : (
          <span aria-hidden>d20</span>
        )}
      </button>
    </div>
  );
}
