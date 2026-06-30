'use client';

import { cn } from '@codex/ui';

export type TableSidebarTab = 'play' | 'dice' | 'log';
export type TableMobileTab = 'map' | TableSidebarTab;

export const SIDEBAR_TAB_IDS = ['play', 'dice', 'log'] as const;
export const MOBILE_TAB_IDS = ['map', ...SIDEBAR_TAB_IDS] as const;

export const TABLE_TAB_LABELS: Record<TableMobileTab, string> = {
  map: 'Map',
  play: 'Play',
  dice: 'Dice',
  log: 'Log',
};

export function tableTabId(tab: TableMobileTab): string {
  return `table-tab-${tab}`;
}

interface TableViewTablistProps<T extends TableMobileTab> {
  tabs: readonly T[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  ariaLabel: string;
  className?: string;
  getPanelId?: (tab: T) => string;
}

export function TableViewTablist<T extends TableMobileTab>({
  tabs,
  activeTab,
  onTabChange,
  ariaLabel,
  className,
  getPanelId = (tab) => (tab === 'map' ? 'table-map-panel' : 'table-sidebar-panel'),
}: TableViewTablistProps<T>) {
  return (
    <div
      className={cn('flex shrink-0 gap-1 border-b border-border/40 p-1.5', className)}
      role="tablist"
      aria-label={ariaLabel}
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          id={tableTabId(tab)}
          aria-selected={activeTab === tab}
          aria-controls={getPanelId(tab)}
          onClick={() => onTabChange(tab)}
          className={cn(
            'min-h-11 flex-1 rounded-md px-2 py-1.5 text-sm font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            activeTab === tab
              ? 'bg-primary/20 text-primary'
              : 'text-muted-foreground hover:bg-background/50 hover:text-foreground',
          )}
        >
          {TABLE_TAB_LABELS[tab]}
        </button>
      ))}
    </div>
  );
}

/** @deprecated Use TableViewTablist with SIDEBAR_TAB_IDS */
export function TableSidebarTabs({
  activeTab,
  onTabChange,
  className,
}: {
  activeTab: TableSidebarTab;
  onTabChange: (tab: TableSidebarTab) => void;
  className?: string;
}) {
  return (
    <TableViewTablist
      tabs={SIDEBAR_TAB_IDS}
      activeTab={activeTab}
      onTabChange={onTabChange}
      ariaLabel="Table panels"
      className={className}
    />
  );
}
