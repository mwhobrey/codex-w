'use client';

import {
  appendPlayRoomLogEntry,
  createPlayRoomDoc,
  createPlayRoomProviders,
  ensureTableInviteToken,
  getPlayRoomLogArray,
  hydratePlayRoomIndexedDb,
  isValidInviteToken,
  readTableMeta,
  type PlayRoomConnectionStatus,
} from '@codex/sync';
import type { PlaySessionLogEntry } from '@codex/schemas';
import type { Awareness } from 'y-protocols/awareness';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type * as Y from 'yjs';
import { probePartyKitReachable } from '@/lib/partykit-reachable';
import {
  createPlayRoomUrl,
  getPartyKitHost,
  getPartyKitParty,
  partyKitWsParams,
  shouldConnectPartyKit,
} from '@/lib/play-room';
import { readStoredTableInvite, writeStoredTableInvite } from '@/lib/table-invite-storage';
import { resolvePlayRoomInvite } from '@/lib/resolve-table-invite';

export interface UsePlayRoomResult {
  doc: Y.Doc | null;
  awareness: Awareness | null;
  logEntries: PlaySessionLogEntry[];
  connectionStatus: PlayRoomConnectionStatus;
  roomUrl: string;
  resolvedInvite?: string;
  appendLog: (
    entry: Omit<PlaySessionLogEntry, 'id' | 'roomId' | 'createdAt'>,
  ) => PlaySessionLogEntry | null;
  ready: boolean;
}

export function usePlayRoom(roomId: string, inviteToken?: string): UsePlayRoomResult {
  const doc = useMemo(() => createPlayRoomDoc(), []);
  const [awareness, setAwareness] = useState<Awareness | null>(null);
  const [logEntries, setLogEntries] = useState<PlaySessionLogEntry[]>([]);
  const [connectionStatus, setConnectionStatus] =
    useState<PlayRoomConnectionStatus>('connecting');
  const [ready, setReady] = useState(false);
  const [resolvedInvite, setResolvedInvite] = useState<string | undefined>(inviteToken);

  useEffect(() => {
    let providers: ReturnType<typeof createPlayRoomProviders> | null = null;
    let cancelled = false;
    let logArray: ReturnType<typeof getPlayRoomLogArray> | null = null;
    let syncLog: (() => void) | null = null;
    let statusTimer: number | undefined;

    const boot = async () => {
      const indexedDb = await hydratePlayRoomIndexedDb(roomId, doc);

      if (cancelled) {
        indexedDb.destroy();
        return;
      }

      const invite = resolvePlayRoomInvite(roomId, inviteToken, readTableMeta(doc).inviteToken);

      if (invite) {
        writeStoredTableInvite(roomId, invite);
        ensureTableInviteToken(doc, invite);
      }

      if (!cancelled) {
        setResolvedInvite(invite);
      }

      let connectParty = shouldConnectPartyKit() && isValidInviteToken(invite);

      if (connectParty) {
        const reachable = await probePartyKitReachable(
          getPartyKitHost(),
          getPartyKitParty(),
          roomId,
          invite,
        );
        if (!reachable) connectParty = false;
      }

      if (cancelled) {
        indexedDb.destroy();
        return;
      }

      providers = createPlayRoomProviders({
        doc,
        roomId,
        host: getPartyKitHost(),
        party: getPartyKitParty(),
        connect: connectParty,
        attemptLiveSync: shouldConnectPartyKit(),
        params: partyKitWsParams(invite),
        indexedDb,
      });

      if (cancelled) {
        providers.cleanup();
        return;
      }

      setAwareness(providers.awareness);
      logArray = getPlayRoomLogArray(doc);

      syncLog = () => {
        setLogEntries(logArray!.toArray());
      };

      const handleIndexedDbSynced = () => {
        syncLog?.();
        setReady(true);
      };

      logArray.observe(syncLog);
      providers.indexedDb.on('synced', handleIndexedDbSynced);

      if (providers.indexedDb.synced) {
        handleIndexedDbSynced();
      }

      setConnectionStatus(providers.getStatus());

      statusTimer = window.setInterval(() => {
        if (providers) setConnectionStatus(providers.getStatus());
      }, 500);
    };

    void boot();

    return () => {
      cancelled = true;
      if (statusTimer !== undefined) window.clearInterval(statusTimer);
      if (logArray && syncLog) logArray.unobserve(syncLog);
      providers?.cleanup();
      setAwareness(null);
    };
  }, [doc, inviteToken, roomId]);

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
