'use client';

import type { JournalEntry } from '@codex/schemas';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@codex/ui';
import { useCallback } from 'react';

interface SoloJournalProps {
  entries: JournalEntry[];
  onExport: () => void;
}

const typeLabels: Record<JournalEntry['type'], string> = {
  scene: 'Scene',
  oracle: 'Oracle',
  twist: 'Twist',
  risk: 'Risk',
  note: 'Note',
};

export function SoloJournal({ entries, onExport }: SoloJournalProps) {
  const handleExport = useCallback(() => {
    onExport();
  }, [onExport]);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
          Journal
        </CardTitle>
        {entries.length > 0 && (
          <Button type="button" variant="link" size="sm" className="h-auto p-0" onClick={handleExport}>
            Export
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">Your session log appears here.</p>
        ) : (
          <ol className="max-h-80 space-y-3 overflow-y-auto pr-1">
            {[...entries].reverse().map((entry) => (
              <li
                key={entry.id}
                className="rounded-lg border border-border bg-secondary/50 px-3 py-2.5"
              >
                <p className="text-[10px] font-medium uppercase tracking-wide text-primary">
                  {typeLabels[entry.type]}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-foreground">{entry.content}</p>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
