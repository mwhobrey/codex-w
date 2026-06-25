'use client';

import {
  clampTableSidebarWidth,
  readTableSidebarWidth,
  TABLE_SIDEBAR_WIDTH,
  writeTableSidebarWidth,
} from '@/lib/table-sidebar-width';
import { useCallback, useEffect, useState } from 'react';

export function useTableSidebarWidth() {
  const [width, setWidthState] = useState<number>(TABLE_SIDEBAR_WIDTH.default);

  useEffect(() => {
    setWidthState(readTableSidebarWidth());
  }, []);

  const setWidth = useCallback((next: number) => {
    const clamped = clampTableSidebarWidth(next);
    setWidthState(clamped);
    writeTableSidebarWidth(clamped);
  }, []);

  const adjustWidth = useCallback((delta: number) => {
    setWidthState((current) => {
      const next = clampTableSidebarWidth(current + delta);
      writeTableSidebarWidth(next);
      return next;
    });
  }, []);

  return { width, setWidth, adjustWidth };
}
