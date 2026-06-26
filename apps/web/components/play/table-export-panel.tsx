'use client';

import { exportTableToSoloSession, journalRepo, soloSessionRepo } from '@codex/sync';
import { Button } from '@codex/ui';
import { useState } from 'react';
import type { TableMeta } from '@codex/schemas';
import type { PlaySessionLogEntry } from '@codex/schemas';

interface TableExportPanelProps {
  meta: TableMeta;
  logEntries: PlaySessionLogEntry[];
  ownerId: string;
}

export function TableExportPanel({ meta, logEntries, ownerId }: TableExportPanelProps) {
  const [status, setStatus] = useState<string | null>(null);

  const handleExport = async () => {
    const { session, journalEntries } = exportTableToSoloSession(meta, logEntries, ownerId);
    await soloSessionRepo.save(session);
    for (const entry of journalEntries) {
      await journalRepo.append(entry);
    }
    setStatus(`Archived as "${session.name}" (${journalEntries.length} log entries)`);
  };

  return (
    <div
      className="rounded-lg border border-border/50 bg-background/30 p-3"
      data-testid="table-export-panel"
    >
      <p className="text-xs text-muted-foreground">
        Save this table&apos;s meta and session log to local Dexie as a solo archive.
      </p>
      <Button type="button" size="sm" variant="outline" className="mt-2" onClick={() => void handleExport()}>
        Export to solo archive
      </Button>
      {status ? (
        <p className="mt-2 text-xs text-primary" aria-live="polite">
          {status}
        </p>
      ) : null}
    </div>
  );
}
