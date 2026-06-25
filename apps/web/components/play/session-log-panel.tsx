'use client';

import type { PlaySessionLogEntry } from '@codex/schemas';
import { Button, Card, CardContent, CardHeader, CardTitle, Label, Textarea } from '@codex/ui';
import { useState } from 'react';

interface SessionLogPanelProps {
  entries: PlaySessionLogEntry[];
  onAppend: (
    entry: Omit<PlaySessionLogEntry, 'id' | 'roomId' | 'createdAt'>,
  ) => PlaySessionLogEntry | null;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function SessionLogPanel({ entries, onAppend }: SessionLogPanelProps) {
  const [journal, setJournal] = useState('');

  const addJournal = () => {
    const trimmed = journal.trim();
    if (!trimmed) return;
    onAppend({
      type: 'journal',
      content: trimmed,
      author: 'You',
    });
    setJournal('');
  };

  return (
    <Card className="flex h-full min-h-0 flex-col border-codex-border/60 bg-codex-surface/80">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Session log</CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
        <div>
          <Label htmlFor="room-journal" className="text-xs">
            Journal note
          </Label>
          <Textarea
            id="room-journal"
            value={journal}
            onChange={(event) => setJournal(event.target.value)}
            rows={2}
            className="mt-1 resize-none"
            placeholder="Scene beat, ruling, table chatter…"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={addJournal}
            disabled={!journal.trim()}
          >
            Add note
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-codex-border/40 bg-codex-void/40 p-2">
          {entries.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-codex-text-muted">
              Rolls and notes appear here for everyone in the room.
            </p>
          ) : (
            <ul className="space-y-2" aria-live="polite">
              {[...entries].reverse().map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-md border border-codex-border/30 bg-codex-elevated/40 px-3 py-2 text-sm"
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-codex-text-muted">
                    <span className="uppercase tracking-wide">{entry.type}</span>
                    <time dateTime={entry.createdAt}>{formatTime(entry.createdAt)}</time>
                  </div>
                  <p className="mt-1 text-codex-text">{entry.content}</p>
                  {entry.type === 'roll' && entry.total !== undefined && (
                    <p className="mt-1 font-mono text-codex-ember">{entry.total}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
