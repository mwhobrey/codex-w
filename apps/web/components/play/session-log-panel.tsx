'use client';

import type { PlaySessionLogEntry } from '@codex/schemas';
import { Button, Card, CardContent, CardHeader, CardTitle, Textarea, cn } from '@codex/ui';
import {
  LOG_FILTER_OPTIONS,
  LOG_TYPE_LABELS,
  LOG_TYPE_STYLES,
  type LogFilterKey,
  matchesLogFilters,
} from '@/lib/log-entry-labels';
import { useMemo, useState } from 'react';

interface SessionLogPanelProps {
  entries: PlaySessionLogEntry[];
  onAppend: (
    entry: Omit<PlaySessionLogEntry, 'id' | 'roomId' | 'createdAt'>,
  ) => PlaySessionLogEntry | null;
  logAuthor?: string;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function SessionLogPanel({ entries, onAppend, logAuthor = 'You' }: SessionLogPanelProps) {
  const [journal, setJournal] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<LogFilterKey>>(new Set());

  const filteredEntries = useMemo(
    () => entries.filter((entry) => matchesLogFilters(entry.type, activeFilters)),
    [entries, activeFilters],
  );

  const toggleFilter = (key: LogFilterKey) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const addJournal = () => {
    const trimmed = journal.trim();
    if (!trimmed) return;
    onAppend({
      type: 'journal',
      content: trimmed,
      author: logAuthor,
    });
    setJournal('');
  };

  return (
    <Card className="flex h-full min-h-[280px] flex-col border-codex-border/60 bg-codex-surface/80 lg:min-h-0">
      <CardHeader className="shrink-0 space-y-2 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">Session log</CardTitle>
          <p className="text-xs text-codex-text-muted">
            Rolls, oracles, and notes — shared with everyone at this table.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter log entries">
          <button
            type="button"
            onClick={() => setActiveFilters(new Set())}
            className={cn(
              'rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors',
              activeFilters.size === 0
                ? 'bg-codex-ember/20 text-codex-ember'
                : 'bg-codex-void/60 text-codex-text-muted hover:text-codex-text',
            )}
          >
            All
          </button>
          {LOG_FILTER_OPTIONS.map((option) => {
            const active = activeFilters.has(option.key);
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => toggleFilter(option.key)}
                className={cn(
                  'rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors',
                  active
                    ? 'bg-codex-ember/20 text-codex-ember'
                    : 'bg-codex-void/60 text-codex-text-muted hover:text-codex-text',
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-3 pt-0">
        <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-codex-border/40 bg-codex-void/40 p-2">
          {filteredEntries.length === 0 ? (
            <p className="px-2 py-8 text-center text-xs text-codex-text-muted">
              {entries.length === 0
                ? 'Nothing logged yet. Roll dice or ask the oracle — it all lands here.'
                : 'No entries match these filters.'}
            </p>
          ) : (
            <ul className="space-y-2" aria-live="polite">
              {[...filteredEntries].reverse().map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-md border border-codex-border/30 bg-codex-elevated/40 px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide',
                        LOG_TYPE_STYLES[entry.type],
                      )}
                    >
                      {LOG_TYPE_LABELS[entry.type]}
                    </span>
                    <time className="text-[10px] text-codex-text-muted" dateTime={entry.createdAt}>
                      {formatTime(entry.createdAt)}
                    </time>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-codex-text">{entry.content}</p>
                  {entry.type === 'roll' && entry.total !== undefined ? (
                    <p className="mt-1 font-display text-2xl font-medium tabular-nums text-codex-ember">
                      {entry.total}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="shrink-0 border-t border-codex-border/30 pt-3">
          <Textarea
            id="room-journal"
            value={journal}
            onChange={(event) => setJournal(event.target.value)}
            rows={2}
            className="resize-none text-sm"
            placeholder="Add a note to the log…"
            onKeyDown={(event) => {
              if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                addJournal();
              }
            }}
          />
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-[10px] text-codex-text-faint">⌘/Ctrl + Enter to post</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addJournal}
              disabled={!journal.trim()}
            >
              Post note
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
