'use client';

import {
  CODEX_MAP_SYMBOLS,
  type CodexMapKind,
  type CodexMapTool,
} from '@/lib/map-symbols';
import { cn } from '@codex/ui';
import { useMemo, useState } from 'react';

type CodexMapTab = CodexMapKind | 'fog';

interface CodexMapToolbarProps {
  activeTool: CodexMapTool;
  activeStamp: string | null;
  onSelectTool: (tool: CodexMapTool) => void;
  onStampSelect: (symbolId: string | null) => void;
  onClearFog?: () => void;
  className?: string;
}

const TAB_LABELS: Record<CodexMapTab, string> = {
  terrain: 'Terrain',
  structure: 'Structures',
  token: 'Tokens',
  fog: 'Fog',
};

export function CodexMapToolbar({
  activeTool,
  activeStamp,
  onSelectTool,
  onStampSelect,
  onClearFog,
  className,
}: CodexMapToolbarProps) {
  const [tab, setTab] = useState<CodexMapTab>('terrain');

  const symbols = useMemo(() => {
    if (tab === 'fog') return [];
    return CODEX_MAP_SYMBOLS.filter((symbol) => symbol.kind === tab);
  }, [tab]);

  const handleTabChange = (next: CodexMapTab) => {
    setTab(next);
    if (next === 'fog') {
      onStampSelect(null);
      onSelectTool('fog-hide');
      return;
    }
    if (activeTool === 'fog-hide' || activeTool === 'fog-reveal') {
      onSelectTool('select');
    }
  };

  const hint =
    activeTool === 'fog-hide'
      ? 'Paint fog on the map · Esc to cancel'
      : activeTool === 'fog-reveal'
        ? 'Reveal hidden areas · Esc to cancel'
        : activeStamp
          ? 'Tap the map to place · Esc to cancel'
          : null;

  return (
    <div
      className={cn(
        'shrink-0 border-b border-codex-border/50 bg-codex-surface/80',
        className,
      )}
      data-testid="codex-map-toolbar"
    >
      <div className="flex items-center gap-2 overflow-x-auto px-2 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => {
            onSelectTool('select');
            onStampSelect(null);
          }}
          className={cn(
            'shrink-0 rounded-md px-3 py-2 text-xs font-medium transition-colors min-h-10',
            activeTool === 'select' && !activeStamp
              ? 'bg-codex-ember/20 text-codex-ember'
              : 'text-codex-text-muted hover:bg-codex-void/60 hover:text-codex-text',
          )}
        >
          Select
        </button>

        <span className="h-6 w-px shrink-0 bg-codex-border/60" aria-hidden />

        <div className="flex shrink-0 rounded-md border border-codex-border/50 p-0.5">
          {(['terrain', 'structure', 'token', 'fog'] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => handleTabChange(kind)}
              className={cn(
                'rounded px-2.5 py-1.5 text-xs transition-colors min-h-9 whitespace-nowrap',
                tab === kind
                  ? 'bg-codex-void text-codex-text'
                  : 'text-codex-text-muted hover:text-codex-text',
              )}
            >
              {TAB_LABELS[kind]}
            </button>
          ))}
        </div>
      </div>

      {tab === 'fog' ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-codex-border/30 px-2 py-2">
          <button
            type="button"
            onClick={() => onSelectTool('fog-hide')}
            className={cn(
              'rounded-md border px-3 py-2 text-xs min-h-10',
              activeTool === 'fog-hide'
                ? 'border-codex-ember/60 bg-codex-ember/15 text-codex-ember'
                : 'border-codex-border/40 text-codex-text-muted',
            )}
          >
            Hide
          </button>
          <button
            type="button"
            onClick={() => onSelectTool('fog-reveal')}
            className={cn(
              'rounded-md border px-3 py-2 text-xs min-h-10',
              activeTool === 'fog-reveal'
                ? 'border-codex-ember/60 bg-codex-ember/15 text-codex-ember'
                : 'border-codex-border/40 text-codex-text-muted',
            )}
          >
            Reveal
          </button>
          {onClearFog ? (
            <button
              type="button"
              onClick={onClearFog}
              className="rounded-md border border-codex-border/40 px-3 py-2 text-xs text-codex-text-muted min-h-10 hover:text-codex-text"
            >
              Clear all
            </button>
          ) : null}
        </div>
      ) : (
        <div className="flex gap-1.5 overflow-x-auto border-t border-codex-border/30 px-2 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {symbols.map((symbol) => (
            <button
              key={symbol.id}
              type="button"
              title={symbol.hint}
              onClick={() => {
                onSelectTool('stamp');
                onStampSelect(activeStamp === symbol.id ? null : symbol.id);
                if (activeStamp === symbol.id) onSelectTool('select');
              }}
              className={cn(
                'shrink-0 rounded-md border px-3 py-2 text-xs transition-colors min-h-10 whitespace-nowrap',
                activeStamp === symbol.id
                  ? 'border-codex-ember/60 bg-codex-ember/15 text-codex-ember'
                  : 'border-codex-border/40 text-codex-text-muted hover:border-codex-border hover:text-codex-text',
              )}
            >
              {symbol.label}
            </button>
          ))}
        </div>
      )}

      {hint ? (
        <p className="border-t border-codex-border/30 px-3 py-1.5 text-xs text-codex-ember">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
