import { HocuspocusProvider, WebSocketStatus } from '@hocuspocus/provider';
import { IndexeddbPersistence } from 'y-indexeddb';
import { Awareness } from 'y-protocols/awareness';
import type * as Y from 'yjs';
import { isValidInviteToken } from '../room-invite';
import { syncRelayWebSocketUrl } from '../sync-relay-url';

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

export interface PlayRoomProviders {
  indexedDb: IndexeddbPersistence;
  /** @deprecated use `relay` — kept for existing call sites */
  party?: HocuspocusProvider;
  relay?: HocuspocusProvider;
  awareness: Awareness;
  cleanup: () => void;
  getStatus: () => PlayRoomConnectionStatus;
}

export interface CreatePlayRoomProvidersOptions {
  doc: Y.Doc;
  roomId: string;
  /** e.g. `127.0.0.1:1999` or `pk.example.com` */
  host: string;
  /** @deprecated ignored — kept for API compat with PartyKit-era callers */
  party?: string;
  /** When false, skip websocket (offline-only). */
  connect?: boolean;
  /** When true and invite is missing, surface invite-required instead of local-only. */
  attemptLiveSync?: boolean;
  /** Invite token passed to the relay on connect. */
  params?: Record<string, string>;
  /** Reuse an existing IndexedDB persistence layer (e.g. after invite is resolved). */
  indexedDb?: IndexeddbPersistence;
}

export function createPlayRoomProviders(
  options: CreatePlayRoomProvidersOptions,
): PlayRoomProviders {
  const indexedDb =
    options.indexedDb ?? new IndexeddbPersistence(`codex-play-${options.roomId}`, options.doc);

  let relay: HocuspocusProvider | undefined;
  let localAwareness: Awareness | undefined;

  let authFailed = false;
  const invite = options.params?.invite?.trim();

  if (
    options.connect !== false &&
    typeof globalThis.WebSocket !== 'undefined' &&
    isValidInviteToken(invite)
  ) {
    relay = new HocuspocusProvider({
      url: syncRelayWebSocketUrl(options.host),
      name: options.roomId,
      document: options.doc,
      token: invite,
      onAuthenticationFailed: () => {
        authFailed = true;
        relay?.disconnect();
      },
      onClose: ({ event }) => {
        if (event.code === 4403) {
          authFailed = true;
          relay?.disconnect();
        }
      },
    });
  }

  const awareness = relay?.awareness ?? new Awareness(options.doc);
  if (!relay) localAwareness = awareness;

  const getStatus = (): PlayRoomConnectionStatus => {
    if (authFailed) return 'auth-failed';
    if (!relay) {
      if (options.attemptLiveSync && !isValidInviteToken(invite)) {
        return 'invite-required';
      }
      return 'local-only';
    }
    const wsStatus = relay.configuration.websocketProvider?.status;
    if (relay.synced && wsStatus === WebSocketStatus.Connected) return 'connected';
    if (wsStatus === WebSocketStatus.Connecting) return 'connecting';
    return 'disconnected';
  };

  return {
    indexedDb,
    party: relay,
    relay,
    awareness,
    cleanup: () => {
      relay?.destroy();
      localAwareness?.destroy();
      indexedDb.destroy();
    },
    getStatus,
  };
}
