'use client';

import { cn } from '@codex/ui';
import { useCallback, useRef } from 'react';

interface TableResizeHandleProps {
  onResize: (delta: number) => void;
  className?: string;
}

export function TableResizeHandle({ onResize, className }: TableResizeHandleProps) {
  const dragging = useRef(false);

  const stopDrag = useCallback((target: EventTarget | null, pointerId: number) => {
    dragging.current = false;
    if (target instanceof HTMLElement) {
      try {
        target.releasePointerCapture(pointerId);
      } catch {
        // ignore if capture was already released
      }
    }
  }, []);

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize sidebar"
      data-testid="table-sidebar-resize"
      className={cn(
        'group relative hidden w-2 shrink-0 cursor-col-resize touch-none select-none lg:block',
        className,
      )}
      onPointerDown={(event) => {
        event.preventDefault();
        dragging.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!dragging.current) return;
        onResize(-event.movementX);
      }}
      onPointerUp={(event) => {
        stopDrag(event.currentTarget, event.pointerId);
      }}
      onPointerCancel={(event) => {
        stopDrag(event.currentTarget, event.pointerId);
      }}
    >
      <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-codex-border/40 transition-colors group-hover:bg-codex-ember/50 group-active:bg-codex-ember" />
      <div className="absolute top-1/2 left-1/2 flex h-8 w-1 -translate-x-1/2 -translate-y-1/2 flex-col justify-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <span className="block h-1 w-1 rounded-full bg-codex-text-faint" />
        <span className="block h-1 w-1 rounded-full bg-codex-text-faint" />
        <span className="block h-1 w-1 rounded-full bg-codex-text-faint" />
      </div>
    </div>
  );
}
