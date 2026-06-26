'use client';

import type { CharacterSheet } from '@codex/schemas';
import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@codex/ui';
import Link from 'next/link';
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
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent
        className="flex w-full max-w-md flex-col gap-0 p-0 sm:max-w-md"
        data-testid="character-peek-drawer"
      >
        <SheetHeader className="shrink-0 border-b border-border px-4 py-3 text-left">
          <div className="flex items-center justify-between gap-2 pr-8">
            <div>
              <SheetTitle className="font-display text-lg">Character</SheetTitle>
              <SheetDescription className="sr-only">
                Quick view of the active character at this table.
              </SheetDescription>
            </div>
            {character ? (
              <Button type="button" size="sm" variant="outline" asChild>
                <Link href={`/characters/${character.id}`}>Full editor</Link>
              </Button>
            ) : null}
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <ActiveCharacterPanel
            character={character}
            highlightFieldKey={highlightFieldKey}
            showHeaderEditLink={false}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
