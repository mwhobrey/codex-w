'use client';

import { Button, Textarea } from '@codex/ui';
import { useCallback, useEffect, useState } from 'react';

interface SafetyNotesSectionProps {
  value: string | undefined;
  onSave: (next: string | undefined) => void;
}

/**
 * Shared (not private) lines-and-veils / table-safety notes — anyone at the
 * table can read and edit this, unlike player notes which stay per-person.
 * Explicit Save button matches every other composer in the app.
 */
export function SafetyNotesSection({ value, onSave }: SafetyNotesSectionProps) {
  const [draft, setDraft] = useState(value ?? '');
  const [saved, setSaved] = useState(false);
  const isDirty = draft.trim() !== (value ?? '');

  useEffect(() => {
    setDraft(value ?? '');
  }, [value]);

  const handleSave = useCallback(() => {
    const trimmed = draft.trim();
    if (trimmed === (value ?? '')) return;
    onSave(trimmed || undefined);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  }, [draft, onSave, value]);

  return (
    <div>
      <span className="text-sm font-medium text-foreground">Safety notes</span>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Lines, veils, and table-safety notes — shared and editable by anyone at the table.
      </p>
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Off-limits topics, X-card reminders, tone check-ins…"
        rows={4}
        className="mt-2 text-sm"
        data-testid="safety-notes-input"
      />
      <div className="mt-2 flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleSave}
          disabled={!isDirty}
          data-testid="safety-notes-save"
        >
          Save
        </Button>
        <p className="text-xs text-primary" aria-live="polite">
          {saved ? 'Saved ✓' : ''}
        </p>
      </div>
    </div>
  );
}
