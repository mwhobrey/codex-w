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
import { useCallback, useEffect, useRef, useState } from 'react';
import type * as Y from 'yjs';

const PRUNE_DELAY_MS = 3_000;

function peerTokenSignature(peers: TablePeer[]): string {
  return peers
    .filter((peer) => peer.characterId)
    .map(
      (peer) =>
        `${peer.characterId}:${peer.clientId}:${peer.name}:${peer.characterName ?? ''}:${peer.color}`,
    )
    .sort()
    .join('|');
}

export function useYjsPlayerTokens(doc: Y.Doc | null, peers: TablePeer[]) {
  const [tokens, setTokens] = useState<PlayerTokenView[]>([]);
  const lastSignatureRef = useRef('');
  const pruneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeKeysRef = useRef<Set<string>>(new Set());

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

    const signature = peerTokenSignature(peers);
    if (signature === lastSignatureRef.current) return;
    lastSignatureRef.current = signature;

    const activeKeys = new Set<string>();

    for (const peer of peers) {
      if (!peer.characterId) continue;

      const key = playerTokenKey(peer.characterId);
      activeKeys.add(key);

      const existing = readPlayerTokens(doc).find((token) => token.key === key);
      const spawn = defaultPlayerTokenPosition(peer.clientId);
      upsertPlayerToken(doc, key, {
        clientId: peer.clientId,
        x: existing?.x ?? spawn.x,
        y: existing?.y ?? spawn.y,
        playerName: peer.name,
        characterId: peer.characterId,
        characterName: peer.characterName,
        color: peer.color,
      });
    }

    activeKeysRef.current = activeKeys;

    if (pruneTimerRef.current) {
      clearTimeout(pruneTimerRef.current);
      pruneTimerRef.current = null;
    }

    pruneTimerRef.current = setTimeout(() => {
      prunePlayerTokens(doc, activeKeysRef.current);
      pruneTimerRef.current = null;
    }, PRUNE_DELAY_MS);
  }, [doc, peers]);

  useEffect(
    () => () => {
      if (pruneTimerRef.current) clearTimeout(pruneTimerRef.current);
    },
    [],
  );

  return { tokens };
}
