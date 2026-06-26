import { IndexeddbPersistence } from 'y-indexeddb';
import { Awareness } from 'y-protocols/awareness';
import YPartyKitProvider from 'y-partykit/provider';
import type * as Y from 'yjs';
import { isValidInviteToken } from '../room-invite';

export async function hydratePlayRoomIndexedDb(
  roomId: string,
  doc: Y.Doc,
): Promise<IndexeddbPersistence> {
  const indexedDb = new IndexeddbPersistence(`codex-play-${roomId}`, doc);
  if (!indexedDb.synced) {
    await new Promise<void>((resolve) => {
      indexedDb.on('synced', () => resolve());
    });
  }
  return indexedDb;
}

export type PlayRoomConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'local-only'
  | 'invite-required'
  | 'auth-failed';

/** PartyKit closes with 4403 when invite admission fails. */
const INVITE_CLOSE_CODE = 4403;

export interface PlayRoomProviders {
  indexedDb: IndexeddbPersistence;
  party?: YPartyKitProvider;
  awareness: Awareness;
  cleanup: () => void;
  getStatus: () => PlayRoomConnectionStatus;
}

export interface CreatePlayRoomProvidersOptions {
  doc: Y.Doc;
  roomId: string;
  /** e.g. `127.0.0.1:1999` or `your-project.username.partykit.dev` */
  host: string;
  /** PartyKit party name — defaults to `main` */
  party?: string;
  /** When false, skip websocket (offline-only). */
  connect?: boolean;
  /** When true and invite is missing, surface invite-required instead of local-only. */
  attemptLiveSync?: boolean;
  /** Query params appended to the PartyKit websocket URL (e.g. invite token). */
  params?: Record<string, string>;
  /** Reuse an existing IndexedDB persistence layer (e.g. after invite is resolved). */
  indexedDb?: IndexeddbPersistence;
}

export function createPlayRoomProviders(
  options: CreatePlayRoomProvidersOptions,
): PlayRoomProviders {
  const indexedDb =
    options.indexedDb ?? new IndexeddbPersistence(`codex-play-${options.roomId}`, options.doc);

  let party: YPartyKitProvider | undefined;
  let localAwareness: Awareness | undefined;

  let authFailed = false;
  const invite = options.params?.invite?.trim();

  if (
    options.connect !== false &&
    typeof globalThis.WebSocket !== 'undefined' &&
    isValidInviteToken(invite)
  ) {
    party = new YPartyKitProvider(options.host, options.roomId, options.doc, {
      party: options.party ?? 'main',
      connect: true,
      maxBackoffTime: 5_000,
      params: options.params,
    });
    party.on('connection-close', (event: CloseEvent) => {
      if (event.code === INVITE_CLOSE_CODE) {
        authFailed = true;
        party?.disconnect();
      }
    });
  }

  const awareness = party?.awareness ?? new Awareness(options.doc);
  if (!party) localAwareness = awareness;

  const getStatus = (): PlayRoomConnectionStatus => {
    if (authFailed) return 'auth-failed';
    if (!party) {
      if (options.attemptLiveSync && !isValidInviteToken(invite)) {
        return 'invite-required';
      }
      return 'local-only';
    }
    if (party.wsconnected && party.synced) return 'connected';
    if (party.wsconnecting) return 'connecting';
    return 'disconnected';
  };

  return {
    indexedDb,
    party,
    awareness,
    cleanup: () => {
      party?.destroy();
      localAwareness?.destroy();
      indexedDb.destroy();
    },
    getStatus,
  };
}
