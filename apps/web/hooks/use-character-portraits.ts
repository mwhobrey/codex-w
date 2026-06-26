'use client';

import { characterPortraitRepo, characterSheetRepo } from '@codex/sync';
import type { CharacterPortraitRecord } from '@codex/sync';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useMemo, useState } from 'react';
import { readCharacterPortraitUrl } from '@/lib/character-portrait';

export function useCharacterPortraits(characterIds: string[]): Map<string, string> {
  const stableKey = useMemo(
    () => [...new Set(characterIds.filter(Boolean))].sort().join('\0'),
    [characterIds],
  );

  const ids = useMemo(() => (stableKey ? stableKey.split('\0') : []), [stableKey]);

  const sheets = useLiveQuery(
    async () => {
      if (ids.length === 0) return [];
      return Promise.all(ids.map((id) => characterSheetRepo.get(id)));
    },
    [stableKey],
    [],
  );

  const portraitRecords = useLiveQuery(
    async () => {
      if (ids.length === 0) return [] as CharacterPortraitRecord[];
      const records = await Promise.all(ids.map((id) => characterPortraitRepo.get(id)));
      return records.filter((record): record is CharacterPortraitRecord => record != null);
    },
    [stableKey],
    [],
  );

  const [localUrls, setLocalUrls] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const map = new Map<string, string>();
      for (const record of portraitRecords ?? []) {
        const url = await characterPortraitRepo.getObjectUrl(record.characterId);
        if (url) map.set(record.characterId, url);
      }
      if (!cancelled) setLocalUrls(map);
    })();
    return () => {
      cancelled = true;
    };
  }, [portraitRecords]);

  return useMemo(() => {
    const map = new Map<string, string>();
    for (const sheet of sheets ?? []) {
      if (!sheet) continue;
      const remote = readCharacterPortraitUrl(sheet);
      if (remote) map.set(sheet.id, remote);
    }
    for (const [id, url] of localUrls) {
      if (!map.has(id)) map.set(id, url);
    }
    return map;
  }, [localUrls, sheets]);
}
