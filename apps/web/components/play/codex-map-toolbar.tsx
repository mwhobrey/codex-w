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
  onMapRoleChange?: (role: MapViewRole) => void;
  templates?: MapTemplate[];
  onApplyTemplate?: (templateId: string) => void;
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
  onMapRoleChange,
  templates = [],
  onApplyTemplate,
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
          className="rounded-full border border-codex-border/60 bg-codex-surface/95 px-4 py-2.5 text-xs font-medium text-codex-text shadow-lg backdrop-blur-md min-h-11"
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
              'absolute left-3 z-30 max-w-[min(100%-1.5rem,20rem)] rounded-xl border border-codex-border/60 bg-codex-surface/95 shadow-2xl backdrop-blur-md',
              MAP_FLOATING_BOTTOM_CLASS,
            )
          : 'shrink-0 border-b border-codex-border/50 bg-codex-surface/80',
        className,
      )}
      data-testid="codex-map-toolbar"
    >
      <div className="flex items-center gap-2 overflow-x-auto px-2 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {floating && onToggleCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="shrink-0 rounded-md px-2 py-2 text-xs text-codex-text-muted hover:text-codex-text min-h-10"
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
              ? 'bg-codex-ember/20 text-codex-ember'
              : 'text-codex-text-muted hover:bg-codex-void/60 hover:text-codex-text',
          )}
        >
          Select
        </button>

        <span className="h-6 w-px shrink-0 bg-codex-border/60" aria-hidden />

        <div className="flex shrink-0 rounded-md border border-codex-border/50 p-0.5">
          {(['terrain', 'structure', 'token', 'fog', 'scenes'] as const).map((kind) => (
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
          {onMapRoleChange ? (
            <div className="flex w-full flex-wrap items-center gap-2 pb-1">
              <span className="text-[10px] uppercase tracking-wide text-codex-text-muted">View</span>
              <button
                type="button"
                onClick={() => onMapRoleChange('gm')}
                className={cn(
                  'rounded-md border px-2 py-1 text-xs min-h-8',
                  mapRole === 'gm'
                    ? 'border-codex-ember/60 bg-codex-ember/15 text-codex-ember'
                    : 'border-codex-border/40 text-codex-text-muted',
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
                    ? 'border-codex-ember/60 bg-codex-ember/15 text-codex-ember'
                    : 'border-codex-border/40 text-codex-text-muted',
                )}
              >
                Player
              </button>
            </div>
          ) : null}
          {mapRole === 'gm' ? (
            <>
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
            </>
          ) : (
            <p className="text-xs text-codex-text-muted">Player view — fogged areas stay hidden.</p>
          )}
        </div>
      ) : tab === 'scenes' ? (
        <div className="flex flex-col gap-2 border-t border-codex-border/30 px-2 py-2">
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => onApplyTemplate?.(template.id)}
              className="rounded-md border border-codex-border/40 px-3 py-2 text-left text-xs hover:border-codex-ember/40 hover:bg-codex-void/40"
            >
              <span className="block font-medium text-codex-text">{template.name}</span>
              <span className="block text-codex-text-muted">{template.description}</span>
            </button>
          ))}
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
