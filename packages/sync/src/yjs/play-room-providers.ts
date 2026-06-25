import { IndexeddbPersistence } from 'y-indexeddb';
import YPartyKitProvider from 'y-partykit/provider';
import type * as Y from 'yjs';

export type PlayRoomConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'local-only';

export interface PlayRoomProviders {
  indexedDb: IndexeddbPersistence;
  party?: YPartyKitProvider;
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
}

export function createPlayRoomProviders(
  options: CreatePlayRoomProvidersOptions,
): PlayRoomProviders {
  const indexedDb = new IndexeddbPersistence(`codex-play-${options.roomId}`, options.doc);

  let party: YPartyKitProvider | undefined;

  if (options.connect !== false && typeof globalThis.WebSocket !== 'undefined') {
    party = new YPartyKitProvider(options.host, options.roomId, options.doc, {
      party: options.party ?? 'main',
      connect: true,
      // Cap backoff so a dead PartyKit dev server doesn't hammer the console forever.
      maxBackoffTime: 5_000,
    });
  }

  const getStatus = (): PlayRoomConnectionStatus => {
    if (!party) return 'local-only';
    if (party.wsconnected && party.synced) return 'connected';
    if (party.wsconnecting) return 'connecting';
    return 'disconnected';
  };

  return {
    indexedDb,
    party,
    cleanup: () => {
      party?.destroy();
      indexedDb.destroy();
    },
    getStatus,
  };
}
