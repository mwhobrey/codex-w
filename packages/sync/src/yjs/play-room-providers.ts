import { IndexeddbPersistence } from 'y-indexeddb';
import { Awareness } from 'y-protocols/awareness';
import YPartyKitProvider from 'y-partykit/provider';
import type * as Y from 'yjs';

export type PlayRoomConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'local-only';

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
  /** Query params appended to the PartyKit websocket URL (e.g. invite token). */
  params?: Record<string, string>;
}

export function createPlayRoomProviders(
  options: CreatePlayRoomProvidersOptions,
): PlayRoomProviders {
  const indexedDb = new IndexeddbPersistence(`codex-play-${options.roomId}`, options.doc);

  let party: YPartyKitProvider | undefined;
  let localAwareness: Awareness | undefined;

  if (options.connect !== false && typeof globalThis.WebSocket !== 'undefined') {
    party = new YPartyKitProvider(options.host, options.roomId, options.doc, {
      party: options.party ?? 'main',
      connect: true,
      maxBackoffTime: 5_000,
      params: options.params,
    });
  }

  const awareness = party?.awareness ?? new Awareness(options.doc);
  if (!party) localAwareness = awareness;

  const getStatus = (): PlayRoomConnectionStatus => {
    if (!party) return 'local-only';
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
