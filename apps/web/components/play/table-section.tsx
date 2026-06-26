'use client';

import type { ReactNode } from 'react';

export function TableSection({
  title,
  description,
  children,
  defaultOpen = true,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="group border-b border-border/40 last:border-0">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-2 px-3 py-2.5 marker:content-none [&::-webkit-details-marker]:hidden">
        <span>
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </span>
          {description ? (
            <span className="mt-0.5 block text-xs font-normal normal-case tracking-normal text-muted-foreground/60">
              {description}
            </span>
          ) : null}
        </span>
        <span
          aria-hidden
          className="mt-0.5 shrink-0 text-muted-foreground/60 transition-transform group-open:rotate-180"
        >
          ▾
        </span>
      </summary>
      <div className="space-y-2 px-3 pb-3">{children}</div>
    </details>
  );
}
