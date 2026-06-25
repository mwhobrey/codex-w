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
  variant?: 'default' | 'compact';
}

export function CharacterPicker({
  ownerId,
  value,
  onChange,
  preferredSystemId = 'loner',
  variant = 'default',
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
    <div className="rounded-lg border border-codex-border/50 bg-codex-surface/60 px-3 py-2.5">
      <Label
        htmlFor="active-character"
        className={
          variant === 'compact'
            ? 'mb-1.5 block text-xs font-medium text-codex-text-muted'
            : 'mb-2 block text-xs uppercase tracking-wide'
        }
      >
        Character
      </Label>
      <Select
        id="active-character"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="text-sm"
      >
        <option value="">No character linked</option>
        {sorted.map((sheet) => (
          <option key={sheet.id} value={sheet.id}>
            {sheet.name}
            {variant === 'default'
              ? ` (${sheet.gameSystemId}${
                  sheet.originSystemId && sheet.originSystemId !== sheet.gameSystemId
                    ? ` · from ${sheet.originSystemId}`
                    : ''
                })`
              : ''}
          </option>
        ))}
      </Select>
      {variant === 'default' ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Any character works — cross-play characters keep their story when adapted.{' '}
          <Link href="/characters" className="text-primary hover:underline">
            Manage characters
          </Link>
        </p>
      ) : (
        <p className="mt-1.5 text-[10px] text-codex-text-faint">
          <Link href="/characters" className="hover:text-codex-ember">
            Manage characters
          </Link>
        </p>
      )}
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
