'use client';

import {
  createPlayRoomDoc,
  createPlayRoomProviders,
  ensureTableInviteToken,
  hydratePlayRoomIndexedDb,
  isValidInviteToken,
  readTableMeta,
  type PlayRoomConnectionStatus,
  type PlayRoomProviders,
} from '@codex/sync';
import type * as Y from 'yjs';
import { probePartyKitReachable, seedPartyRoomInvite } from '@/lib/partykit-reachable';
import {
  getPartyKitHost,
  getPartyKitParty,
  partyKitWsParams,
  shouldConnectPartyKit,
} from '@/lib/play-room';
import { resolvePlayRoomInvite } from '@/lib/resolve-table-invite';
import { writeStoredTableInvite } from '@/lib/table-invite-storage';

export interface PlayRoomSessionHandle {
  doc: Y.Doc;
  providers: PlayRoomProviders;
  resolvedInvite?: string;
  getStatus: () => PlayRoomConnectionStatus;
  release: () => void;
}

interface PlayRoomSessionEntry {
  doc: Y.Doc;
  providers: PlayRoomProviders;
  resolvedInvite?: string;
  refcount: number;
}

const sessions = new Map<string, PlayRoomSessionEntry>();
const booting = new Map<string, Promise<PlayRoomSessionEntry>>();

async function bootSession(
  roomId: string,
  inviteToken: string | undefined,
  doc: Y.Doc,
): Promise<PlayRoomSessionEntry> {
  const indexedDb = await hydratePlayRoomIndexedDb(roomId, doc);

  const invite = resolvePlayRoomInvite(roomId, inviteToken, readTableMeta(doc).inviteToken);

  if (invite) {
    writeStoredTableInvite(roomId, invite);
    ensureTableInviteToken(doc, invite);
  }

  let connectParty = shouldConnectPartyKit() && isValidInviteToken(invite);

  if (connectParty) {
    const reachable = await probePartyKitReachable(
      getPartyKitHost(),
      getPartyKitParty(),
      roomId,
      invite,
    );
    if (!reachable) {
      connectParty = false;
    } else if (invite) {
      // Atomically seed the invite token via HTTP before connecting via WebSocket.
      const seeded = await seedPartyRoomInvite(
        getPartyKitHost(),
        getPartyKitParty(),
        roomId,
        invite,
      );
      if (!seeded) {
        console.warn('HTTP invite seeding failed; connection might be rejected.');
      }
    }
  }

  const providers = createPlayRoomProviders({
    doc,
    roomId,
    host: getPartyKitHost(),
    party: getPartyKitParty(),
    connect: connectParty,
    attemptLiveSync: shouldConnectPartyKit(),
    params: partyKitWsParams(invite),
    indexedDb,
  });

  return {
    doc,
    providers,
    resolvedInvite: invite,
    refcount: 0,
  };
}

function releaseSession(roomId: string): void {
  const entry = sessions.get(roomId);
  if (!entry) return;
  entry.refcount -= 1;
  if (entry.refcount <= 0) {
    entry.providers.cleanup();
    sessions.delete(roomId);
    booting.delete(roomId);
  }
}

export async function acquirePlayRoomSession(
  roomId: string,
  inviteToken?: string,
): Promise<PlayRoomSessionHandle> {
  const existing = sessions.get(roomId);
  if (existing) {
    existing.refcount += 1;
    return {
      doc: existing.doc,
      providers: existing.providers,
      resolvedInvite: existing.resolvedInvite,
      getStatus: () => existing.providers.getStatus(),
      release: () => releaseSession(roomId),
    };
  }

  let pending = booting.get(roomId);
  if (!pending) {
    const doc = createPlayRoomDoc();
    pending = bootSession(roomId, inviteToken, doc).then((entry) => {
      sessions.set(roomId, entry);
      booting.delete(roomId);
      return entry;
    });
    booting.set(roomId, pending);
  }

  const entry = await pending;
  entry.refcount += 1;

  return {
    doc: entry.doc,
    providers: entry.providers,
    resolvedInvite: entry.resolvedInvite,
    getStatus: () => entry.providers.getStatus(),
    release: () => releaseSession(roomId),
  };
}

/** @internal Reset between tests */
export function resetPlayRoomSessionsForTests(): void {
  for (const entry of sessions.values()) {
    entry.providers.cleanup();
  }
  sessions.clear();
  booting.clear();
}
