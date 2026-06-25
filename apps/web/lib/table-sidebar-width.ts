const STORAGE_KEY = 'codex-table-sidebar-width';

export const TABLE_SIDEBAR_WIDTH = {
  default: 380,
  min: 300,
  max: 640,
} as const;

export function readTableSidebarWidth(): number {
  if (typeof window === 'undefined') return TABLE_SIDEBAR_WIDTH.default;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return TABLE_SIDEBAR_WIDTH.default;
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) return TABLE_SIDEBAR_WIDTH.default;
    return Math.min(TABLE_SIDEBAR_WIDTH.max, Math.max(TABLE_SIDEBAR_WIDTH.min, parsed));
  } catch {
    return TABLE_SIDEBAR_WIDTH.default;
  }
}

export function writeTableSidebarWidth(width: number): void {
  if (typeof window === 'undefined') return;
  const clamped = Math.min(TABLE_SIDEBAR_WIDTH.max, Math.max(TABLE_SIDEBAR_WIDTH.min, width));
  localStorage.setItem(STORAGE_KEY, String(clamped));
}

export function clampTableSidebarWidth(width: number): number {
  return Math.min(TABLE_SIDEBAR_WIDTH.max, Math.max(TABLE_SIDEBAR_WIDTH.min, width));
}
