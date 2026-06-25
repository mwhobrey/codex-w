'use client';

import {
  appendPlayRoomLogEntry,
  createPlayRoomDoc,
  createPlayRoomProviders,
} from '@codex/sync';
import type { RollResult } from '@codex/game-engine';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { probePartyKitReachable } from '@/lib/partykit-reachable';
import {
  getPartyKitHost,
  getPartyKitParty,
  shouldConnectPartyKit,
} from '@/lib/play-room';

export function usePlayRoomLogPush(roomId: string | null) {
  const doc = useMemo(() => (roomId ? createPlayRoomDoc() : null), [roomId]);
  const [ready, setReady] = useState(false);
  const [connected, setConnected] = useState(false);
  const docRef = useRef(doc);
  docRef.current = doc;

  useEffect(() => {
    if (!doc || !roomId) {
      setReady(false);
      setConnected(false);
      return;
    }

    let providers: ReturnType<typeof createPlayRoomProviders> | null = null;
    let cancelled = false;

    const boot = async () => {
      let connectParty = shouldConnectPartyKit();
      if (connectParty) {
        const reachable = await probePartyKitReachable(
          getPartyKitHost(),
          getPartyKitParty(),
          roomId,
        );
        if (!reachable) connectParty = false;
      }

      if (cancelled) return;

      providers = createPlayRoomProviders({
        doc,
        roomId,
        host: getPartyKitHost(),
        party: getPartyKitParty(),
        connect: connectParty,
      });

      setConnected(connectParty);

      const handleSynced = () => {
        if (!cancelled) setReady(true);
      };

      providers.indexedDb.on('synced', handleSynced);
      if (providers.indexedDb.synced) handleSynced();
    };

    void boot();

    return () => {
      cancelled = true;
      providers?.cleanup();
    };
  }, [doc, roomId]);

  const pushRoll = useCallback(
    (result: RollResult, author = 'You') => {
      const activeDoc = docRef.current;
      if (!activeDoc || !roomId) return null;
      return appendPlayRoomLogEntry(activeDoc, {
        roomId,
        type: 'roll',
        content: `${result.notation} → ${result.total}`,
        notation: result.notation,
        total: result.total,
        author,
      });
    },
    [roomId],
  );

  return { roomId, ready, connected, pushRoll };
}
