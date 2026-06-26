'use client';

import { appendPlayRoomLogEntry } from '@codex/sync';
import type { RollResult } from '@codex/game-engine';
import { useCallback, useEffect, useRef, useState } from 'react';
import type * as Y from 'yjs';
import { acquirePlayRoomSession } from '@/lib/play-room-session';
import { resolvePlayRoomInvite } from '@/lib/resolve-table-invite';

export function usePlayRoomLogPush(roomId: string | null) {
  const [ready, setReady] = useState(false);
  const [connected, setConnected] = useState(false);
  const docRef = useRef<Y.Doc | null>(null);

  useEffect(() => {
    if (!roomId) {
      docRef.current = null;
      setReady(false);
      setConnected(false);
      return;
    }

    let cancelled = false;
    let release: (() => void) | null = null;
    let statusTimer: number | undefined;

    const boot = async () => {
      const invite = resolvePlayRoomInvite(roomId);
      const session = await acquirePlayRoomSession(roomId, invite);
      if (cancelled) {
        session.release();
        return;
      }

      release = session.release;
      docRef.current = session.doc;

      const syncStatus = () => {
        const status = session.getStatus();
        setConnected(status === 'connected');
      };

      const handleSynced = () => {
        if (!cancelled) {
          setReady(true);
          syncStatus();
        }
      };

      session.providers.indexedDb.on('synced', handleSynced);
      if (session.providers.indexedDb.synced) {
        handleSynced();
      }

      syncStatus();
      statusTimer = window.setInterval(syncStatus, 500);
    };

    void boot();

    return () => {
      cancelled = true;
      if (statusTimer !== undefined) window.clearInterval(statusTimer);
      release?.();
      docRef.current = null;
      setReady(false);
      setConnected(false);
    };
  }, [roomId]);

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
