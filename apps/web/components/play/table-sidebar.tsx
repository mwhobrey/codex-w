'use client';

import { cn } from '@codex/ui';

export type TableSidebarTab = 'play' | 'dice' | 'log';

const TAB_LABELS: Record<TableSidebarTab, string> = {
  play: 'Play',
  dice: 'Dice',
  log: 'Log',
};

interface TableSidebarTabsProps {
  activeTab: TableSidebarTab;
  onTabChange: (tab: TableSidebarTab) => void;
  className?: string;
}

export function TableSidebarTabs({ activeTab, onTabChange, className }: TableSidebarTabsProps) {
  return (
    <div
      className={cn('flex shrink-0 gap-1 border-b border-codex-border/40 p-1.5', className)}
      role="tablist"
      aria-label="Table panels"
    >
      {(['play', 'dice', 'log'] as const).map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={activeTab === tab}
          onClick={() => onTabChange(tab)}
          className={cn(
            'min-h-9 flex-1 rounded-md px-2 py-1.5 text-sm font-medium transition-colors',
            activeTab === tab
              ? 'bg-codex-ember/20 text-codex-ember'
              : 'text-codex-text-muted hover:bg-codex-void/50 hover:text-codex-text',
          )}
        >
          {TAB_LABELS[tab]}
        </button>
      ))}
    </div>
  );
}
