import { describe, expect, it, vi, beforeEach } from 'vitest';
import * as Y from 'yjs';
import { createPlayRoomProviders, hydratePlayRoomIndexedDb } from './play-room-providers';
import { IndexeddbPersistence } from 'y-indexeddb';
import YPartyKitProvider from 'y-partykit/provider';

vi.mock('y-indexeddb', () => {
  return {
    IndexeddbPersistence: vi.fn().mockImplementation(() => {
      return {
        synced: true,
        destroy: vi.fn(),
        on: vi.fn(),
      };
    }),
  };
});

vi.mock('y-partykit/provider', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        destroy: vi.fn(),
        disconnect: vi.fn(),
        on: vi.fn(),
        wsconnected: false,
        wsconnecting: false,
        synced: false,
        awareness: {
          destroy: vi.fn(),
        },
      };
    }),
  };
});

describe('play-room-providers', () => {
  let doc: Y.Doc;

  beforeEach(() => {
    doc = new Y.Doc();
    vi.clearAllMocks();
  });

  it('creates local-only provider when connect is false', () => {
    const providers = createPlayRoomProviders({
      doc,
      roomId: 'test-room',
      host: 'localhost:1999',
      connect: false,
    });

    expect(providers.party).toBeUndefined();
    expect(providers.getStatus()).toBe('local-only');
    expect(IndexeddbPersistence).toHaveBeenCalled();
  });

  it('creates local-only provider when no valid invite is provided', () => {
    const providers = createPlayRoomProviders({
      doc,
      roomId: 'test-room',
      host: 'localhost:1999',
      params: { invite: 'short' }, // invalid token
    });

    expect(providers.party).toBeUndefined();
    expect(providers.getStatus()).toBe('local-only');
  });

  it('returns invite-required when attemptLiveSync is true and invite is missing/invalid', () => {
    const providers = createPlayRoomProviders({
      doc,
      roomId: 'test-room',
      host: 'localhost:1999',
      attemptLiveSync: true,
      params: {},
    });

    expect(providers.party).toBeUndefined();
    expect(providers.getStatus()).toBe('invite-required');
  });

  it('creates partykit provider when connect is true and valid invite is provided', () => {
    const providers = createPlayRoomProviders({
      doc,
      roomId: 'test-room',
      host: 'localhost:1999',
      params: { invite: 'valid-token-abcdefghij' },
    });

    expect(providers.party).toBeDefined();
    expect(YPartyKitProvider).toHaveBeenCalled();
  });

  it('reports correct connection status based on partykit state', () => {
    const providers = createPlayRoomProviders({
      doc,
      roomId: 'test-room',
      host: 'localhost:1999',
      params: { invite: 'valid-token-abcdefghij' },
    });

    const party = providers.party as any;

    // Default disconnected
    expect(providers.getStatus()).toBe('disconnected');

    // Connecting
    party.wsconnecting = true;
    expect(providers.getStatus()).toBe('connecting');

    // Connected but not synced
    party.wsconnecting = false;
    party.wsconnected = true;
    expect(providers.getStatus()).toBe('disconnected');

    // Connected and synced
    party.synced = true;
    expect(providers.getStatus()).toBe('connected');
  });

  it('handles invite close code 4403 as auth-failed', () => {
    let closeHandler: any;
    vi.mocked(YPartyKitProvider).mockImplementationOnce((host, room, doc, opts) => {
      const mockParty = {
        destroy: vi.fn(),
        disconnect: vi.fn(),
        on: vi.fn((event, cb) => {
          if (event === 'connection-close') {
            closeHandler = cb;
          }
        }),
        wsconnected: false,
        wsconnecting: false,
        synced: false,
        awareness: {},
      };
      return mockParty as any;
    });

    const providers = createPlayRoomProviders({
      doc,
      roomId: 'test-room',
      host: 'localhost:1999',
      params: { invite: 'valid-token-abcdefghij' },
    });

    expect(closeHandler).toBeDefined();
    expect(providers.getStatus()).toBe('disconnected');

    // Trigger normal close
    closeHandler({ code: 1000 });
    expect(providers.getStatus()).toBe('disconnected');

    // Trigger 4403 close
    closeHandler({ code: 4403 });
    expect(providers.getStatus()).toBe('auth-failed');
    expect(providers.party?.disconnect).toHaveBeenCalled();
  });

  it('cleans up resources on cleanup()', () => {
    const providers = createPlayRoomProviders({
      doc,
      roomId: 'test-room',
      host: 'localhost:1999',
      params: { invite: 'valid-token-abcdefghij' },
    });

    providers.cleanup();

    expect(providers.party?.destroy).toHaveBeenCalled();
    expect(providers.indexedDb.destroy).toHaveBeenCalled();
  });

  it('hydratePlayRoomIndexedDb awaits synced event if not initially synced', async () => {
    let onSyncedCallback: (() => void) | undefined;

    vi.mocked(IndexeddbPersistence).mockImplementationOnce(() => {
      return {
        synced: false,
        on: vi.fn((event, cb) => {
          if (event === 'synced') {
            onSyncedCallback = cb;
          }
        }),
        destroy: vi.fn(),
      } as any;
    });

    const mockDoc = new Y.Doc();
    const hydrationPromise = hydratePlayRoomIndexedDb('test-room', mockDoc);

    expect(onSyncedCallback).toBeDefined();

    // Resolve it
    onSyncedCallback!();

    const db = await hydrationPromise;
    expect(db.synced).toBe(false);
  });

  it('does not create partykit provider if WebSocket is undefined', () => {
    const originalWebSocket = globalThis.WebSocket;
    // @ts-expect-error - overriding global
    delete globalThis.WebSocket;

    try {
      const providers = createPlayRoomProviders({
        doc,
        roomId: 'test-room',
        host: 'localhost:1999',
        params: { invite: 'valid-token-abcdefghij' },
      });

      expect(providers.party).toBeUndefined();
      expect(providers.getStatus()).toBe('local-only');
    } finally {
      globalThis.WebSocket = originalWebSocket;
    }
  });

  it('cleans up local awareness when partykit provider is not created', () => {
    const providers = createPlayRoomProviders({
      doc,
      roomId: 'test-room',
      host: 'localhost:1999',
      connect: false,
    });

    const destroySpy = vi.spyOn(providers.awareness, 'destroy');
    providers.cleanup();
    expect(destroySpy).toHaveBeenCalled();
  });
});
