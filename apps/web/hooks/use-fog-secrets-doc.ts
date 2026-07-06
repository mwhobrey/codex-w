'use client';

import { fogSecretsDocName, getPlayRoomExcalidrawElements, reconcileFogSecrets } from '@codex/sync';
import { syncRelayWebSocketUrl } from '@codex/sync/sync-relay-url';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { IndexeddbPersistence } from 'y-indexeddb';
import { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';

export interface UseFogSecretsDocOptions {
  roomId: string;
  host: string;
  isTableGm: boolean;
  ownerId?: string;
  publicDoc: Y.Doc | null;
  hiddenCells: ReadonlySet<string>;
}

/**
 * GM-only Yjs document holding whatever's currently hidden under fog, kept
 * in sync with the public doc's elements/files as fog is painted, revealed,
 * or new elements land in an already-fogged region. Only ever created when
 * this client is the confirmed table GM — non-GM clients never attempt this
 * connection, so hidden content never reaches their machine at all (unlike
 * the fog overlay, which only hides content visually while the full scene
 * still replicates to every peer).
 */
export function useFogSecretsDoc({
  roomId,
  host,
  isTableGm,
  ownerId,
  publicDoc,
  hiddenCells,
}: UseFogSecretsDocOptions): Y.Doc | null {
  const [secretsDoc, setSecretsDoc] = useState<Y.Doc | null>(null);
  const hiddenCellsRef = useRef(hiddenCells);
  hiddenCellsRef.current = hiddenCells;

  useEffect(() => {
    if (!isTableGm || !ownerId || typeof globalThis.WebSocket === 'undefined') {
      setSecretsDoc(null);
      return;
    }

    const doc = new Y.Doc();
    const indexedDb = new IndexeddbPersistence(`codex-play-secrets-${roomId}`, doc);
    const relay = new HocuspocusProvider({
      url: syncRelayWebSocketUrl(host),
      name: fogSecretsDocName(roomId),
      document: doc,
      token: ownerId,
    });

    setSecretsDoc(doc);

    return () => {
      relay.destroy();
      indexedDb.destroy();
      doc.destroy();
      setSecretsDoc((current) => (current === doc ? null : current));
    };
  }, [roomId, host, isTableGm, ownerId]);

  // Catches elements landing in an already-fogged region (e.g. a player
  // drawing there) — always reads the latest hiddenCells via ref since this
  // observer is set up once per doc pair, not re-created on every fog change.
  useEffect(() => {
    if (!publicDoc || !secretsDoc) return;

    const reconcile = () => reconcileFogSecrets(publicDoc, secretsDoc, hiddenCellsRef.current);
    reconcile();

    const publicElements = getPlayRoomExcalidrawElements(publicDoc);
    publicElements.observe(reconcile);
    return () => publicElements.unobserve(reconcile);
  }, [publicDoc, secretsDoc]);

  // Catches fog itself being painted/revealed over existing elements.
  useEffect(() => {
    if (!publicDoc || !secretsDoc) return;
    reconcileFogSecrets(publicDoc, secretsDoc, hiddenCells);
  }, [publicDoc, secretsDoc, hiddenCells]);

  return secretsDoc;
}
