'use client';

import {
  claimTableGmIfVacant,
  ensureTableInviteToken,
  type PlayRoomConnectionStatus,
} from '@codex/sync';
import type { TableMeta } from '@codex/schemas';
import { pushPlayRoomSync } from '@/lib/play-room-sync';
import { recordRecentPlayRoom } from '@/lib/recent-play-rooms';
import { resolvePlayRoomInvite } from '@/lib/resolve-table-invite';
import { writeStoredTableInvite } from '@/lib/table-invite-storage';
import { useEffect, useLayoutEffect, useState } from 'react';
import type * as Y from 'yjs';

interface UsePlayRoomInviteOptions {
  roomId: string;
  inviteToken?: string;
  metaInviteToken?: string;
}

/** Resolve / persist invite token from URL, meta, and local storage. */
export function usePlayRoomInvite({
  roomId,
  inviteToken,
  metaInviteToken,
}: UsePlayRoomInviteOptions): {
  partyInvite: string | undefined;
  setPartyInvite: (token: string | undefined) => void;
} {
  const [partyInvite, setPartyInvite] = useState(() => resolvePlayRoomInvite(roomId, inviteToken));

  useLayoutEffect(() => {
    if (inviteToken) writeStoredTableInvite(roomId, inviteToken);
  }, [inviteToken, roomId]);

  useEffect(() => {
    const next = resolvePlayRoomInvite(roomId, inviteToken, metaInviteToken);
    if (next && next !== partyInvite) setPartyInvite(next);
  }, [inviteToken, metaInviteToken, partyInvite, roomId]);

  return { partyInvite, setPartyInvite };
}

interface UsePlayRoomBootstrapOptions {
  roomId: string;
  doc: Y.Doc | null;
  ready: boolean;
  connectionStatus: PlayRoomConnectionStatus;
  ownerId: string | undefined;
  ownerReady: boolean;
  tableGm: boolean;
  authUserId: string | undefined;
  meta: TableMeta | null;
  inviteToken?: string;
  partyInvite?: string;
  resolvedInvite?: string;
}

/** Invite seed, GM claim, recent-room index, and cloud lobby push. */
export function usePlayRoomBootstrap({
  roomId,
  doc,
  ready,
  connectionStatus,
  ownerId,
  ownerReady,
  tableGm,
  authUserId,
  meta,
  inviteToken,
  partyInvite,
  resolvedInvite,
}: UsePlayRoomBootstrapOptions): void {
  useEffect(() => {
    if (!ready || !doc) return;
    const token = inviteToken ?? resolvedInvite ?? partyInvite ?? meta?.inviteToken;
    if (token) {
      ensureTableInviteToken(doc, token);
      writeStoredTableInvite(roomId, token);
    }
  }, [doc, inviteToken, meta?.inviteToken, partyInvite, ready, resolvedInvite, roomId]);

  useEffect(() => {
    if (!ready || typeof window === 'undefined') return;
    const token = inviteToken ?? resolvedInvite ?? partyInvite ?? meta?.inviteToken;
    if (!token) return;
    const url = new URL(window.location.href);
    if (!url.searchParams.has('invite')) return;
    url.searchParams.delete('invite');
    window.history.replaceState(null, '', url.toString());
  }, [inviteToken, meta?.inviteToken, partyInvite, ready, resolvedInvite]);

  useEffect(() => {
    if (!ready || !ownerReady || !doc || !ownerId) return;
    if (connectionStatus !== 'connected' && connectionStatus !== 'local-only') return;
    claimTableGmIfVacant(doc, ownerId);
  }, [connectionStatus, doc, ownerId, ownerReady, ready]);

  useEffect(() => {
    if (ready && meta) {
      recordRecentPlayRoom(
        roomId,
        meta.name,
        meta.gameSystemId,
        meta.inviteToken ?? resolvedInvite ?? partyInvite ?? inviteToken,
      );
    }
  }, [
    inviteToken,
    ready,
    roomId,
    meta?.name,
    meta?.gameSystemId,
    meta?.inviteToken,
    partyInvite,
    resolvedInvite,
    meta,
  ]);

  useEffect(() => {
    if (!ready || !meta || !tableGm || !authUserId) return;
    const invite =
      meta.inviteToken ?? resolvedInvite ?? partyInvite ?? inviteToken ?? undefined;
    if (!invite) return;
    void pushPlayRoomSync({
      roomId,
      ownerId: authUserId,
      name: meta.name,
      gameSystemId: meta.gameSystemId,
      inviteToken: invite,
      updatedAt: new Date().toISOString(),
    });
  }, [
    authUserId,
    inviteToken,
    meta?.gameSystemId,
    meta?.inviteToken,
    meta?.name,
    meta,
    partyInvite,
    ready,
    resolvedInvite,
    roomId,
    tableGm,
  ]);
}
