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
    <details open={defaultOpen} className="group border-b border-codex-border/40 last:border-0">
      <summary className="cursor-pointer list-none px-3 py-2.5 marker:content-none">
        <span className="text-xs font-medium uppercase tracking-wide text-codex-text-muted">
          {title}
        </span>
        {description ? (
          <span className="mt-0.5 block text-xs font-normal normal-case tracking-normal text-codex-text-faint">
            {description}
          </span>
        ) : null}
      </summary>
      <div className="space-y-2 px-3 pb-3">{children}</div>
    </details>
  );
}
