'use client';

import { characterSheetRepo } from '@codex/sync';
import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { readCharacterPortraitUrl } from '@/lib/character-portrait';

export function useCharacterPortraits(characterIds: string[]): Map<string, string> {
  const stableKey = useMemo(
    () => [...new Set(characterIds.filter(Boolean))].sort().join('\0'),
    [characterIds],
  );

  const sheets = useLiveQuery(
    async () => {
      const ids = stableKey ? stableKey.split('\0') : [];
      if (ids.length === 0) return [];
      return Promise.all(ids.map((id) => characterSheetRepo.get(id)));
    },
    [stableKey],
    [],
  );

  return useMemo(() => {
    const map = new Map<string, string>();
    for (const sheet of sheets ?? []) {
      if (!sheet) continue;
      const url = readCharacterPortraitUrl(sheet);
      if (url) map.set(sheet.id, url);
    }
    return map;
  }, [sheets]);
}
