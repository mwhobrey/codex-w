'use client';

import { appendPlayRoomLogEntry, type PlayRoomConnectionStatus } from '@codex/sync';
import type { RollResult } from '@codex/game-engine';
import { useCallback, useEffect, useRef, useState } from 'react';
import type * as Y from 'yjs';
import { acquirePlayRoomSession } from '@/lib/play-room-session';
import { resolvePlayRoomInvite } from '@/lib/resolve-table-invite';

export function usePlayRoomLogPush(roomId: string | null, inviteToken?: string | null) {
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<PlayRoomConnectionStatus>('connecting');
  const docRef = useRef<Y.Doc | null>(null);

  useEffect(() => {
    if (!roomId) {
      docRef.current = null;
      setReady(false);
      setStatus('connecting');
      return;
    }

    let cancelled = false;
    let release: (() => void) | null = null;
    let statusTimer: number | undefined;

    const boot = async () => {
      const invite = resolvePlayRoomInvite(roomId, inviteToken ?? undefined);
      const session = await acquirePlayRoomSession(roomId, invite);
      if (cancelled) {
        session.release();
        return;
      }

      release = session.release;
      docRef.current = session.doc;

      const syncStatus = () => {
        setStatus(session.getStatus());
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
      setStatus('connecting');
    };
  }, [inviteToken, roomId]);

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

  return {
    roomId,
    ready,
    status,
    connected: status === 'connected',
    pushRoll,
  };
}

export function diceHubLogStatusMessage(
  ready: boolean,
  status: PlayRoomConnectionStatus,
): string {
  if (!ready) return 'Connecting to room log…';
  switch (status) {
    case 'connected':
      return 'Synced live with the room.';
    case 'invite-required':
      return 'Invite code required for live sync — reopen Dice from the table.';
    case 'auth-failed':
      return 'Invite rejected — check your link or reopen Dice from the table.';
    case 'kicked':
      return 'Removed from this table by the GM.';
    case 'connecting':
    case 'disconnected':
      return 'Reconnecting to the sync relay…';
    case 'local-only':
    default:
      return 'Saved locally — will sync when the sync relay is online.';
  }
}
