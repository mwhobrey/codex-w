'use client';

import type { TableMeta } from '@codex/schemas';
import { Textarea } from '@codex/ui';
import { useEffect, useRef, useState } from 'react';

interface TableScratchNotesProps {
  meta: TableMeta;
  onSave: (notes: string) => void;
}

export function TableScratchNotes({ meta, onSave }: TableScratchNotesProps) {
  const [notes, setNotes] = useState(meta.scratchNotes ?? '');
  const saveTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    setNotes(meta.scratchNotes ?? '');
  }, [meta.scratchNotes]);

  useEffect(() => {
    if (notes === (meta.scratchNotes ?? '')) return;

    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => onSave(notes), 600);

    return () => window.clearTimeout(saveTimer.current);
  }, [notes, meta.scratchNotes, onSave]);

  return (
    <details className="rounded-lg border border-border/50 bg-card/60">
      <summary className="cursor-pointer list-none px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground marker:content-none">
        Scratch pad
        <span className="ml-2 font-normal normal-case tracking-normal text-muted-foreground/60">
          — private, auto-saves
        </span>
      </summary>
      <div className="border-t border-border/40 px-3 pb-3 pt-2">
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Rulings, NPC names, loot, vibes…"
          className="resize-y min-h-[72px] text-sm"
        />
      </div>
    </details>
  );
}
