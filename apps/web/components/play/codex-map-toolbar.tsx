'use client';

import { CODEX_MAP_SYMBOLS, type CodexMapKind } from '@/lib/map-symbols';
import { cn } from '@codex/ui';
import { useMemo, useState } from 'react';

export type CodexMapTool = 'select' | 'stamp';

interface CodexMapToolbarProps {
  activeStamp: string | null;
  onStampSelect: (symbolId: string | null) => void;
  className?: string;
}

export function CodexMapToolbar({ activeStamp, onStampSelect, className }: CodexMapToolbarProps) {
  const [tab, setTab] = useState<CodexMapKind>('terrain');

  const symbols = useMemo(
    () => CODEX_MAP_SYMBOLS.filter((symbol) => symbol.kind === tab),
    [tab],
  );

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 border-b border-codex-border/50 bg-codex-surface/80 px-2 py-1.5',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onStampSelect(null)}
        className={cn(
          'rounded-md px-2 py-1 text-xs font-medium transition-colors',
          activeStamp === null
            ? 'bg-codex-ember/20 text-codex-ember'
            : 'text-codex-text-muted hover:bg-codex-void/60 hover:text-codex-text',
        )}
      >
        Select
      </button>

      <span className="mx-1 h-4 w-px bg-codex-border/60" aria-hidden />

      <div className="flex rounded-md border border-codex-border/50 p-0.5">
        {(['terrain', 'structure'] as const).map((kind) => (
          <button
            key={kind}
            type="button"
            onClick={() => setTab(kind)}
            className={cn(
              'rounded px-2 py-0.5 text-xs capitalize transition-colors',
              tab === kind
                ? 'bg-codex-void text-codex-text'
                : 'text-codex-text-muted hover:text-codex-text',
            )}
          >
            {kind === 'structure' ? 'Structures' : 'Terrain'}
          </button>
        ))}
      </div>

      <span className="mx-1 h-4 w-px bg-codex-border/60" aria-hidden />

      <div className="flex flex-wrap gap-1">
        {symbols.map((symbol) => (
          <button
            key={symbol.id}
            type="button"
            title={symbol.hint}
            onClick={() => onStampSelect(activeStamp === symbol.id ? null : symbol.id)}
            className={cn(
              'rounded-md border px-2 py-1 text-xs transition-colors',
              activeStamp === symbol.id
                ? 'border-codex-ember/60 bg-codex-ember/15 text-codex-ember'
                : 'border-codex-border/40 text-codex-text-muted hover:border-codex-border hover:text-codex-text',
            )}
          >
            {symbol.label}
          </button>
        ))}
      </div>

      {activeStamp ? (
        <p className="ml-auto hidden text-xs text-codex-ember sm:block">
          Click the map to place · Esc or Select to cancel
        </p>
      ) : null}
    </div>
  );
}
