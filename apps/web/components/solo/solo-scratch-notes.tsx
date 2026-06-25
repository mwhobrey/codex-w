'use client';

import type { SoloSession } from '@codex/schemas';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Textarea } from '@codex/ui';
import { useEffect, useState } from 'react';

interface SoloScratchNotesProps {
  session: SoloSession;
  onSave: (notes: string) => void;
}

export function SoloScratchNotes({ session, onSave }: SoloScratchNotesProps) {
  const stored = typeof session.gameState?.scratchNotes === 'string' ? session.gameState.scratchNotes : '';
  const [notes, setNotes] = useState(stored);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setNotes(stored);
    setDirty(false);
  }, [session.id, stored]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
          Scratch pad
        </CardTitle>
        <CardDescription>
          Free-form notes for this session — not every beat belongs in the journal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setDirty(true);
          }}
          rows={6}
          placeholder="Rulings, NPC names, loot, vibes…"
          className="resize-y min-h-[120px]"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!dirty}
          onClick={() => {
            onSave(notes);
            setDirty(false);
          }}
        >
          Save notes
        </Button>
      </CardContent>
    </Card>
  );
}
