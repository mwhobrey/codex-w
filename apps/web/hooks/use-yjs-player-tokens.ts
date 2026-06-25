'use client';

import type { TablePeer } from '@/hooks/use-table-awareness';
import {
  defaultPlayerTokenPosition,
  getPlayRoomPlayerTokensMap,
  playerTokenKey,
  prunePlayerTokens,
  readPlayerTokens,
  upsertPlayerToken,
  type PlayerTokenView,
} from '@codex/sync';
import { useCallback, useEffect, useState } from 'react';
import type * as Y from 'yjs';

export function useYjsPlayerTokens(doc: Y.Doc | null, peers: TablePeer[]) {
  const [tokens, setTokens] = useState<PlayerTokenView[]>([]);

  const syncFromDoc = useCallback(() => {
    if (!doc) {
      setTokens([]);
      return;
    }
    setTokens(readPlayerTokens(doc));
  }, [doc]);

  useEffect(() => {
    if (!doc) {
      setTokens([]);
      return;
    }

    const yTokens = getPlayRoomPlayerTokensMap(doc);
    syncFromDoc();
    yTokens.observe(syncFromDoc);
    return () => yTokens.unobserve(syncFromDoc);
  }, [doc, syncFromDoc]);

  useEffect(() => {
    if (!doc) return;

    const activeKeys = new Set<string>();

    for (const peer of peers) {
      if (!peer.characterId) continue;

      const key = playerTokenKey(peer.characterId);
      activeKeys.add(key);

      const spawn = defaultPlayerTokenPosition(peer.clientId);
      upsertPlayerToken(doc, key, {
        clientId: peer.clientId,
        x: spawn.x,
        y: spawn.y,
        playerName: peer.name,
        characterId: peer.characterId,
        characterName: peer.characterName,
        color: peer.color,
      });
    }

    prunePlayerTokens(doc, activeKeys);
  }, [doc, peers]);

  return { tokens };
}
