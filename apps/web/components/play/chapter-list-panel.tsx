'use client';

import { importPlaySessionToTable, journalRepo, playSessionRepo } from '@codex/sync';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@codex/ui';
import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import type * as Y from 'yjs';
import type { JournalEntry, TableMeta } from '@codex/schemas';

const RECAP_TYPES = new Set<JournalEntry['type']>(['scene', 'twist']);
const RECAP_ENTRY_COUNT = 3;

interface ChapterListPanelProps {
  doc: Y.Doc;
  roomId: string;
  ownerId: string;
  onReopen: (meta: TableMeta) => void;
}

export function ChapterListPanel({ doc, roomId, ownerId, onReopen }: ChapterListPanelProps) {
  const [reopeningId, setReopeningId] = useState<string | null>(null);
  const [recap, setRecap] = useState<{ chapterNumber?: number; entries: JournalEntry[] } | null>(null);
  const chapters = useLiveQuery(
    () => playSessionRepo.listByRoom(ownerId, roomId),
    [ownerId, roomId],
  );

  const handleReopen = async (sessionId: string) => {
    setReopeningId(sessionId);
    try {
      const session = await playSessionRepo.get(sessionId);
      if (!session) return;
      const entries = await journalRepo.listBySession(sessionId);
      const meta = importPlaySessionToTable(doc, roomId, session, entries);
      const recapEntries = entries.filter((entry) => RECAP_TYPES.has(entry.type)).slice(-RECAP_ENTRY_COUNT);
      setRecap(recapEntries.length ? { chapterNumber: session.chapterNumber, entries: recapEntries } : null);
      onReopen(meta);
    } finally {
      setReopeningId(null);
    }
  };

  return (
    <>
      {recap ? (
        <Card className="border-border/60 bg-card/80" data-testid="chapter-recap-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Previously, on Chapter {recap.chapterNumber ?? '?'}…
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {recap.entries.map((entry) => (
                <li key={entry.id} className="text-sm text-foreground">
                  {entry.content}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
      {chapters?.length ? (
        <Card className="border-border/60 bg-card/80" data-testid="chapter-list-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Chapters</CardTitle>
            <CardDescription>
              Past chapters closed from this table — reopen one to continue it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {chapters.map((session) => (
                <li
                  key={session.id}
                  className="flex items-center gap-2 rounded-lg border border-border/40 bg-background/40 p-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">
                      Chapter {session.chapterNumber ?? '?'}
                      {session.name ? ` · ${session.name}` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(session.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    disabled={reopeningId === session.id}
                    data-testid={`reopen-chapter-${session.id}`}
                    onClick={() => void handleReopen(session.id)}
                  >
                    {reopeningId === session.id ? 'Reopening…' : 'Reopen'}
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
