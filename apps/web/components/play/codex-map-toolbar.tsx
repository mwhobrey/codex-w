'use client';

import {
  CODEX_MAP_SYMBOLS,
  type CodexMapKind,
  type CodexMapTool,
} from '@/lib/map-symbols';
import { MAP_FLOATING_BOTTOM_CLASS } from '@/lib/map-overlay-layout';
import type { MapTemplate } from '@/lib/map-templates';
import type { MapViewRole } from '@/lib/table-systems';
import { cn } from '@codex/ui';
import { useMemo, useState } from 'react';

type CodexMapTab = CodexMapKind | 'fog' | 'scenes';

interface CodexMapToolbarProps {
  activeTool: CodexMapTool;
  activeStamp: string | null;
  onSelectTool: (tool: CodexMapTool) => void;
  onStampSelect: (symbolId: string | null) => void;
  onClearFog?: () => void;
  variant?: 'dock' | 'floating';
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
  mapRole?: MapViewRole;
  isTableGm?: boolean;
  onMapRoleChange?: (role: MapViewRole) => void;
  templates?: MapTemplate[];
  onApplyTemplate?: (templateId: string) => void;
  canBreakApart?: boolean;
  onBreakApart?: () => void;
}

const TAB_LABELS: Record<CodexMapTab, string> = {
  terrain: 'Terrain',
  structure: 'Structures',
  token: 'Tokens',
  fog: 'Fog',
  scenes: 'Scenes',
};

export function CodexMapToolbar({
  activeTool,
  activeStamp,
  onSelectTool,
  onStampSelect,
  onClearFog,
  variant = 'dock',
  collapsed = false,
  onToggleCollapse,
  className,
  mapRole = 'gm',
  isTableGm = false,
  onMapRoleChange,
  templates = [],
  onApplyTemplate,
  canBreakApart = false,
  onBreakApart,
}: CodexMapToolbarProps) {
  const [tab, setTab] = useState<CodexMapTab>('terrain');
  const floating = variant === 'floating';

  const symbols = useMemo(() => {
    if (tab === 'fog' || tab === 'scenes') return [];
    return CODEX_MAP_SYMBOLS.filter((symbol) => symbol.kind === tab);
  }, [tab]);

  const handleTabChange = (next: CodexMapTab) => {
    setTab(next);
    if (next === 'fog') {
      onStampSelect(null);
      onSelectTool('fog-hide');
      return;
    }
    if (next === 'scenes') {
      onStampSelect(null);
      onSelectTool('select');
      return;
    }
    if (activeTool === 'fog-hide' || activeTool === 'fog-reveal') {
      onSelectTool('select');
    }
  };

  const hint =
    activeTool === 'fog-hide'
      ? 'Drag on the map to hide · Esc to cancel'
      : activeTool === 'fog-reveal'
        ? 'Drag on the map to reveal · Esc to cancel'
        : activeStamp
          ? 'Drag on the map to place · Esc to cancel'
          : null;

  if (floating && collapsed) {
    return (
      <div
        className={cn('absolute left-3 z-30', MAP_FLOATING_BOTTOM_CLASS, className)}
        data-testid="codex-map-toolbar"
      >
        <button
          type="button"
          onClick={onToggleCollapse}
          className="rounded-full border border-border/60 bg-card/95 px-4 py-2.5 text-xs font-medium text-foreground shadow-lg backdrop-blur-md min-h-11"
        >
          Map tools
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        floating
          ? cn(
              'absolute left-3 z-30 flex max-h-[min(70vh,28rem)] min-h-0 max-w-[min(100%-1.5rem,22rem)] flex-col overflow-hidden rounded-xl border border-border/60 bg-card/95 shadow-2xl backdrop-blur-md',
              MAP_FLOATING_BOTTOM_CLASS,
            )
          : 'flex max-h-[min(40vh,18rem)] min-h-0 shrink-0 flex-col overflow-hidden border-b border-border/50 bg-card/80 lg:max-h-[min(55vh,28rem)]',
        className,
      )}
      data-testid="codex-map-toolbar"
    >
      <div className="flex shrink-0 flex-wrap items-center gap-2 px-2 py-2">
        {floating && onToggleCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="shrink-0 rounded-md px-2 py-2 text-xs text-muted-foreground hover:text-foreground min-h-10"
            aria-label="Collapse map tools"
          >
            ✕
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => {
            onSelectTool('select');
            onStampSelect(null);
          }}
          className={cn(
            'shrink-0 rounded-md px-3 py-2 text-xs font-medium transition-colors min-h-10',
            activeTool === 'select' && !activeStamp
              ? 'bg-primary/20 text-primary'
              : 'text-muted-foreground hover:bg-background/60 hover:text-foreground',
          )}
        >
          Select
        </button>

        <span className="h-6 w-px shrink-0 bg-border/60" aria-hidden />

        <div className="flex flex-wrap gap-1 rounded-md border border-border/50 p-0.5">
          {(['terrain', 'structure', 'token', 'fog', 'scenes'] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => handleTabChange(kind)}
              className={cn(
                'rounded px-2.5 py-1.5 text-xs transition-colors min-h-9 whitespace-nowrap',
                tab === kind
                  ? 'bg-background text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {TAB_LABELS[kind]}
            </button>
          ))}
        </div>

        {canBreakApart && onBreakApart ? (
          <button
            type="button"
            onClick={onBreakApart}
            className="rounded-md border border-border/40 px-3 py-2 text-xs text-muted-foreground min-h-10 hover:border-primary/40 hover:text-foreground"
            data-testid="map-break-apart"
          >
            Break apart
          </button>
        ) : null}
      </div>

      {tab === 'fog' ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-wrap items-center gap-2 border-t border-border/30 px-2 py-2">
          {isTableGm && onMapRoleChange ? (
            <div className="flex w-full flex-wrap items-center gap-2 pb-1">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Preview</span>
              <button
                type="button"
                onClick={() => onMapRoleChange('gm')}
                className={cn(
                  'rounded-md border px-2 py-1 text-xs min-h-8',
                  mapRole === 'gm'
                    ? 'border-primary/60 bg-primary/15 text-primary'
                    : 'border-border/40 text-muted-foreground',
                )}
              >
                GM
              </button>
              <button
                type="button"
                onClick={() => onMapRoleChange('player')}
                className={cn(
                  'rounded-md border px-2 py-1 text-xs min-h-8',
                  mapRole === 'player'
                    ? 'border-primary/60 bg-primary/15 text-primary'
                    : 'border-border/40 text-muted-foreground',
                )}
              >
                Player
              </button>
            </div>
          ) : null}
          {isTableGm && mapRole === 'gm' ? (
            <>
              <button
                type="button"
                onClick={() => onSelectTool('fog-hide')}
                className={cn(
                  'rounded-md border px-3 py-2 text-xs min-h-10',
                  activeTool === 'fog-hide'
                    ? 'border-primary/60 bg-primary/15 text-primary'
                    : 'border-border/40 text-muted-foreground',
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
                    ? 'border-primary/60 bg-primary/15 text-primary'
                    : 'border-border/40 text-muted-foreground',
                )}
              >
                Reveal
              </button>
              {onClearFog ? (
                <button
                  type="button"
                  onClick={onClearFog}
                  className="rounded-md border border-border/40 px-3 py-2 text-xs text-muted-foreground min-h-10 hover:text-foreground"
                >
                  Clear all
                </button>
              ) : null}
            </>
          ) : (
            <p className="text-xs text-muted-foreground">Player view — fogged areas stay hidden.</p>
          )}
        </div>
        </div>
      ) : tab === 'scenes' ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2 border-t border-border/30 px-2 py-2">
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => onApplyTemplate?.(template.id)}
              className="rounded-md border border-border/40 px-3 py-2 text-left text-xs hover:border-primary/40 hover:bg-background/40"
            >
              <span className="block font-medium text-foreground">{template.name}</span>
              <span className="block text-muted-foreground">{template.description}</span>
            </button>
          ))}
        </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-wrap gap-1.5 border-t border-border/30 px-2 py-2">
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
                  ? 'border-primary/60 bg-primary/15 text-primary'
                  : 'border-border/40 text-muted-foreground hover:border-border hover:text-foreground',
              )}
            >
              {symbol.label}
            </button>
          ))}
        </div>
        </div>
      )}

      {hint ? (
        <p className="border-t border-border/30 px-3 py-1.5 text-xs text-primary">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
