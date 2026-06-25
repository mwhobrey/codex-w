'use client';

import { characterSheetRepo } from '@codex/sync';
import type { CharacterSheet } from '@codex/schemas';
import { Label, Select } from '@codex/ui';
import { useLiveQuery } from 'dexie-react-hooks';
import Link from 'next/link';

interface CharacterPickerProps {
  ownerId: string;
  value: string | undefined;
  onChange: (characterId: string | undefined) => void;
  /** Prefer characters from this system, but show all for cross-play */
  preferredSystemId?: string;
}

export function CharacterPicker({
  ownerId,
  value,
  onChange,
  preferredSystemId = 'loner',
}: CharacterPickerProps) {
  const sheets = useLiveQuery(
    () => (ownerId ? characterSheetRepo.listByOwner(ownerId) : Promise.resolve(undefined)),
    [ownerId],
  );

  const sorted = [...(sheets ?? [])].sort((a, b) => {
    const aPref =
      a.gameSystemId === preferredSystemId || a.originSystemId === preferredSystemId ? 0 : 1;
    const bPref =
      b.gameSystemId === preferredSystemId || b.originSystemId === preferredSystemId ? 0 : 1;
    if (aPref !== bPref) return aPref - bPref;
    return b.updatedAt.localeCompare(a.updatedAt);
  });

  return (
    <div>
      <Label htmlFor="active-character" className="mb-2 block text-xs uppercase tracking-wide">
        Active character
      </Label>
      <Select
        id="active-character"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || undefined)}
      >
        <option value="">No character linked</option>
        {sorted.map((sheet) => (
          <option key={sheet.id} value={sheet.id}>
            {sheet.name} ({sheet.gameSystemId}
            {sheet.originSystemId && sheet.originSystemId !== sheet.gameSystemId
              ? ` · from ${sheet.originSystemId}`
              : ''}
            )
          </option>
        ))}
      </Select>
      <p className="mt-2 text-xs text-muted-foreground">
        Any character works — cross-play characters keep their story when adapted.{' '}
        <Link href="/characters" className="text-primary hover:underline">
          Manage characters
        </Link>
      </p>
    </div>
  );
}

export function useCharacter(characterId: string | undefined): CharacterSheet | null {
  const character = useLiveQuery(
    () => (characterId ? characterSheetRepo.get(characterId) : Promise.resolve(undefined)),
    [characterId],
    undefined,
  );
  return character ?? null;
}
