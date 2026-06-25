'use client';

import { createPlayRoomDoc, createPlayRoomProviders } from '@codex/sync';
import { useEffect, useMemo, useState } from 'react';
import type * as Y from 'yjs';

export function useSoloMap(sessionId: string | undefined) {
  const doc = useMemo(() => createPlayRoomDoc(), [sessionId]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    const roomId = `solo-${sessionId}`;
    const providers = createPlayRoomProviders({
      doc,
      roomId,
      host: '127.0.0.1:1999',
      connect: false,
    });

    const handleSynced = () => setReady(true);
    providers.indexedDb.on('synced', handleSynced);
    if (providers.indexedDb.synced) setReady(true);

    return () => {
      providers.cleanup();
      setReady(false);
    };
  }, [doc, sessionId]);

  return { doc: sessionId ? doc : null, ready };
}
