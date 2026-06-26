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
      className={cn('flex shrink-0 gap-1 border-b border-border/40 p-1.5', className)}
      role="tablist"
      aria-label="Table panels"
    >
      {(['play', 'dice', 'log'] as const).map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          id={`table-sidebar-tab-${tab}`}
          aria-selected={activeTab === tab}
          aria-controls="table-sidebar-panel"
          onClick={() => onTabChange(tab)}
          className={cn(
            'min-h-9 flex-1 rounded-md px-2 py-1.5 text-sm font-medium transition-colors',
            activeTab === tab
              ? 'bg-primary/20 text-primary'
              : 'text-muted-foreground hover:bg-background/50 hover:text-foreground',
          )}
        >
          {TAB_LABELS[tab]}
        </button>
      ))}
    </div>
  );
}
