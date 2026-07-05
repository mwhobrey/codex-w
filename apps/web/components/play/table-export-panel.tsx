'use client';

import { closeChapter, journalRepo, playSessionRepo } from '@codex/sync';
import { Button, ConfirmDialog } from '@codex/ui';
import { useState } from 'react';
import type { TableMeta } from '@codex/schemas';
import type { PlaySessionLogEntry } from '@codex/schemas';
import type * as Y from 'yjs';
import { queueJournalSync, queueSessionSync } from '@/lib/session-sync';

interface TableExportPanelProps {
  doc: Y.Doc;
  roomId: string;
  meta: TableMeta;
  logEntries: PlaySessionLogEntry[];
  ownerId: string;
  isGm: boolean;
  gmName?: string;
}

export function TableExportPanel({
  doc,
  roomId,
  meta,
  logEntries,
  ownerId,
  isGm,
  gmName,
}: TableExportPanelProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [ending, setEnding] = useState(false);

  if (!isGm) return null;

  const handleEndSession = async () => {
    setEnding(true);
    try {
      const { session, journalEntries } = closeChapter(doc, roomId, logEntries, ownerId, gmName);
      await playSessionRepo.save(session);
      for (const entry of journalEntries) {
        await journalRepo.append(entry);
      }
      void queueSessionSync(session);
      for (const entry of journalEntries) {
        void queueJournalSync(entry, ownerId);
      }
      setStatus(`Chapter ${session.chapterNumber ?? ''} archived (${journalEntries.length} log entries)`.trim());
    } finally {
      setEnding(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div
      className="rounded-lg border border-border/50 bg-background/30 p-3"
      data-testid="table-export-panel"
    >
      <p className="text-xs text-muted-foreground">
        Archive this chapter&apos;s log and start a fresh one. Past chapters stay searchable.
      </p>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="mt-2"
        onClick={() => setConfirmOpen(true)}
      >
        End session
      </Button>
      {status ? (
        <p className="mt-2 text-xs text-primary" aria-live="polite">
          {status}
        </p>
      ) : null}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="End this session?"
        description="The current log will be archived as a chapter and cleared to start the next one. This can't be undone from the table."
        confirmLabel="End session"
        destructive
        confirming={ending}
        onConfirm={handleEndSession}
      />
    </div>
  );
}
