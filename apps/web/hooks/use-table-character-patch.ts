'use client';

import type { CharacterSheet } from '@codex/schemas';
import { characterSheetRepo } from '@codex/sync';
import { useCallback } from 'react';

export function useTableCharacterPatch(characterId: string | undefined) {
  const patchCharacter = useCallback(
    async (
      mutator: (sheet: CharacterSheet) => CharacterSheet,
    ): Promise<CharacterSheet | null> => {
      if (!characterId) return null;
      const sheet = await characterSheetRepo.get(characterId);
      if (!sheet) return null;
      const next = mutator(sheet);
      await characterSheetRepo.save(next);
      return next;
    },
    [characterId],
  );

  return { patchCharacter };
}
