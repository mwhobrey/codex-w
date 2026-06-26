'use client';

import { appendPlayRoomLogEntry, getPlayRoomLogArray } from '@codex/sync';
import type { PlaySessionLogEntry } from '@codex/schemas';
import type { Awareness } from 'y-protocols/awareness';
import { useCallback, useEffect, useState } from 'react';
import type * as Y from 'yjs';
import { acquirePlayRoomSession } from '@/lib/play-room-session';
import { createPlayRoomUrl } from '@/lib/play-room';

export interface UsePlayRoomResult {
  doc: Y.Doc | null;
  awareness: Awareness | null;
  logEntries: PlaySessionLogEntry[];
  connectionStatus: import('@codex/sync').PlayRoomConnectionStatus;
  roomUrl: string;
  resolvedInvite?: string;
  appendLog: (
    entry: Omit<PlaySessionLogEntry, 'id' | 'roomId' | 'createdAt'>,
  ) => PlaySessionLogEntry | null;
  ready: boolean;
}

export function usePlayRoom(roomId: string, inviteToken?: string): UsePlayRoomResult {
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [awareness, setAwareness] = useState<Awareness | null>(null);
  const [logEntries, setLogEntries] = useState<PlaySessionLogEntry[]>([]);
  const [connectionStatus, setConnectionStatus] =
    useState<import('@codex/sync').PlayRoomConnectionStatus>('connecting');
  const [ready, setReady] = useState(false);
  const [resolvedInvite, setResolvedInvite] = useState<string | undefined>(inviteToken);

  useEffect(() => {
    let cancelled = false;
    let release: (() => void) | null = null;
    let logArray: ReturnType<typeof getPlayRoomLogArray> | null = null;
    let syncLog: (() => void) | null = null;
    let statusTimer: number | undefined;

    const boot = async () => {
      const session = await acquirePlayRoomSession(roomId, inviteToken);
      if (cancelled) {
        session.release();
        return;
      }

      release = session.release;
      setDoc(session.doc);
      setResolvedInvite(session.resolvedInvite);
      setAwareness(session.providers.awareness);

      logArray = getPlayRoomLogArray(session.doc);
      syncLog = () => setLogEntries(logArray!.toArray());

      const handleIndexedDbSynced = () => {
        syncLog?.();
        setReady(true);
      };

      logArray.observe(syncLog);
      session.providers.indexedDb.on('synced', handleIndexedDbSynced);

      if (session.providers.indexedDb.synced) {
        handleIndexedDbSynced();
      } else {
        syncLog();
      }

      setConnectionStatus(session.getStatus());
      statusTimer = window.setInterval(() => {
        setConnectionStatus(session.getStatus());
      }, 500);
    };

    void boot();

    return () => {
      cancelled = true;
      if (statusTimer !== undefined) window.clearInterval(statusTimer);
      if (logArray && syncLog) logArray.unobserve(syncLog);
      release?.();
      setDoc(null);
      setAwareness(null);
      setReady(false);
    };
  }, [inviteToken, roomId]);

  const appendLog = useCallback(
    (entry: Omit<PlaySessionLogEntry, 'id' | 'roomId' | 'createdAt'>) => {
      if (!doc) return null;
      return appendPlayRoomLogEntry(doc, { ...entry, roomId });
    },
    [doc, roomId],
  );

  return {
    doc,
    awareness,
    logEntries,
    connectionStatus,
    roomUrl: createPlayRoomUrl(roomId, undefined, resolvedInvite ?? inviteToken),
    resolvedInvite,
    appendLog,
    ready,
  };
}
