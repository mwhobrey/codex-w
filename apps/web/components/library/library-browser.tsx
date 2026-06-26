'use client';

import type { LibraryEntry } from '@codex/game-systems';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@codex/ui';
import { useMemo, useState } from 'react';

interface LibraryBrowserProps {
  entries: LibraryEntry[];
}

export function LibraryBrowser({ entries }: LibraryBrowserProps) {
  const systems = useMemo(
    () => [...new Set(entries.map((entry) => entry.systemId))],
    [entries],
  );
  const [filter, setFilter] = useState<string>('all');

  const visible =
    filter === 'all' ? entries : entries.filter((entry) => entry.systemId === filter);

  return (
    <div data-testid="library-browser">
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`rounded-full border px-3 py-1 text-xs ${
            filter === 'all' ? 'border-codex-ember text-codex-ember' : 'border-codex-border text-codex-text-muted'
          }`}
        >
          All systems
        </button>
        {systems.map((systemId) => (
          <button
            key={systemId}
            type="button"
            onClick={() => setFilter(systemId)}
            className={`rounded-full border px-3 py-1 text-xs capitalize ${
              filter === systemId
                ? 'border-codex-ember text-codex-ember'
                : 'border-codex-border text-codex-text-muted'
            }`}
          >
            {systemId}
          </button>
        ))}
      </div>

      <ul className="space-y-4">
        {visible.map((entry) => (
          <li key={entry.id}>
            <Card className="border-codex-border/60 bg-codex-surface/80">
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-base">{entry.title}</CardTitle>
                  <Badge variant="secondary">{entry.systemName}</Badge>
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {entry.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="max-h-64 space-y-1 overflow-y-auto text-sm text-codex-text-muted">
                  {entry.rows.map((row, index) => (
                    <li key={`${entry.id}-${index}`}>
                      {row.roll !== undefined ? (
                        <span className="mr-2 font-mono text-codex-ember">{row.roll}</span>
                      ) : null}
                      {row.label ? (
                        <span className="mr-2 font-medium text-codex-text">{row.label}</span>
                      ) : null}
                      {row.text}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
