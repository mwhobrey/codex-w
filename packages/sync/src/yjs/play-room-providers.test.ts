import { describe, expect, it, vi, beforeEach } from 'vitest';
import * as Y from 'yjs';
import { HocuspocusProvider, WebSocketStatus } from '@hocuspocus/provider';
import { IndexeddbPersistence } from 'y-indexeddb';
import { createPlayRoomProviders, hydratePlayRoomIndexedDb } from './play-room-providers';

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

vi.mock('@hocuspocus/provider', () => {
  return {
    WebSocketStatus: {
      Connecting: 'connecting',
      Connected: 'connected',
      Disconnected: 'disconnected',
    },
    HocuspocusProvider: vi.fn().mockImplementation(() => {
      return {
        destroy: vi.fn(),
        disconnect: vi.fn(),
        synced: false,
        awareness: {
          destroy: vi.fn(),
        },
        configuration: {
          websocketProvider: {
            status: 'disconnected',
          },
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

    expect(providers.relay).toBeUndefined();
    expect(providers.getStatus()).toBe('local-only');
    expect(IndexeddbPersistence).toHaveBeenCalled();
  });

  it('creates local-only provider when no valid invite is provided', () => {
    const providers = createPlayRoomProviders({
      doc,
      roomId: 'test-room',
      host: 'localhost:1999',
      params: { invite: 'short' },
    });

    expect(providers.relay).toBeUndefined();
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

    expect(providers.relay).toBeUndefined();
    expect(providers.getStatus()).toBe('invite-required');
  });

  it('creates relay provider when connect is true and valid invite is provided', () => {
    const providers = createPlayRoomProviders({
      doc,
      roomId: 'test-room',
      host: 'localhost:1999',
      params: { invite: 'valid-token-abcdefghij' },
    });

    expect(providers.relay).toBeDefined();
    expect(HocuspocusProvider).toHaveBeenCalled();
  });

  it('reports correct connection status based on relay state', () => {
    const providers = createPlayRoomProviders({
      doc,
      roomId: 'test-room',
      host: 'localhost:1999',
      params: { invite: 'valid-token-abcdefghij' },
    });

    const relay = providers.relay as {
      synced: boolean;
      configuration: { websocketProvider: { status: string } };
    };

    expect(providers.getStatus()).toBe('disconnected');

    relay.configuration.websocketProvider.status = WebSocketStatus.Connecting;
    expect(providers.getStatus()).toBe('connecting');

    relay.configuration.websocketProvider.status = WebSocketStatus.Connected;
    relay.synced = true;
    expect(providers.getStatus()).toBe('connected');
  });

  it('handles onAuthenticationFailed as auth-failed', () => {
    let authFailedHandler: (() => void) | undefined;
    vi.mocked(HocuspocusProvider).mockImplementationOnce((config) => {
      authFailedHandler = config.onAuthenticationFailed;
      return {
        destroy: vi.fn(),
        disconnect: vi.fn(),
        synced: false,
        awareness: {},
        configuration: {
          websocketProvider: { status: WebSocketStatus.Disconnected },
        },
      } as unknown as HocuspocusProvider;
    });

    const providers = createPlayRoomProviders({
      doc,
      roomId: 'test-room',
      host: 'localhost:1999',
      params: { invite: 'valid-token-abcdefghij' },
    });

    expect(authFailedHandler).toBeDefined();
    authFailedHandler!();
    expect(providers.getStatus()).toBe('auth-failed');
  });

  it('cleans up resources on cleanup()', () => {
    const providers = createPlayRoomProviders({
      doc,
      roomId: 'test-room',
      host: 'localhost:1999',
      params: { invite: 'valid-token-abcdefghij' },
    });

    providers.cleanup();

    expect(providers.relay?.destroy).toHaveBeenCalled();
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
      } as unknown as IndexeddbPersistence;
    });

    const mockDoc = new Y.Doc();
    const hydrationPromise = hydratePlayRoomIndexedDb('test-room', mockDoc);

    expect(onSyncedCallback).toBeDefined();
    onSyncedCallback!();

    const db = await hydrationPromise;
    expect(db.synced).toBe(false);
  });

  it('does not create relay provider if WebSocket is undefined', () => {
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

      expect(providers.relay).toBeUndefined();
      expect(providers.getStatus()).toBe('local-only');
    } finally {
      globalThis.WebSocket = originalWebSocket;
    }
  });

  it('cleans up local awareness when relay provider is not created', () => {
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
