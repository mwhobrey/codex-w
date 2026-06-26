'use client';

import type { CharacterSheet } from '@codex/schemas';
import { Button } from '@codex/ui';
import Link from 'next/link';
import { useEffect } from 'react';
import { ActiveCharacterPanel } from '@/components/solo/active-character-panel';

interface CharacterPeekDrawerProps {
  open: boolean;
  onClose: () => void;
  character: CharacterSheet | null;
  highlightFieldKey?: string;
}

export function CharacterPeekDrawer({
  open,
  onClose,
  character,
  highlightFieldKey,
}: CharacterPeekDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" data-testid="character-peek-drawer">
      <button
        type="button"
        className="absolute inset-0 bg-codex-void/60 backdrop-blur-[2px]"
        aria-label="Close character peek"
        onClick={onClose}
      />
      <aside
        className="relative flex h-full w-full max-w-md flex-col border-l border-codex-border/60 bg-codex-surface shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Character sheet"
      >
        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-codex-border/50 px-4 py-3">
          <h2 className="font-display text-lg font-medium text-codex-text">Character</h2>
          <div className="flex items-center gap-2">
            {character ? (
              <Button type="button" size="sm" variant="outline" asChild>
                <Link href={`/characters/${character.id}`}>Full editor</Link>
              </Button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-2 py-1 text-sm text-codex-text-muted hover:bg-codex-elevated/60 hover:text-codex-text"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <ActiveCharacterPanel character={character} highlightFieldKey={highlightFieldKey} />
        </div>
      </aside>
    </div>
  );
}
