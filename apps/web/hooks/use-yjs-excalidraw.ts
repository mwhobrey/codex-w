'use client';

import { getPlayRoomExcalidrawElements, PLAY_ROOM_KEYS } from '@codex/sync';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import type * as Y from 'yjs';

function elementsEqual(a: readonly ExcalidrawElement[], b: readonly unknown[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    const left = a[i];
    const right = b[i] as ExcalidrawElement | undefined;
    if (!left || !right || left.id !== right.id || left.version !== right.version) return false;
  }
  return true;
}

export interface UseYjsExcalidrawResult {
  ready: boolean;
  initialElements: readonly ExcalidrawElement[];
  onChange: (elements: readonly ExcalidrawElement[]) => void;
  bindApi: (api: ExcalidrawImperativeAPI) => void;
}

export function useYjsExcalidraw(doc: Y.Doc | null): UseYjsExcalidrawResult {
  const [ready, setReady] = useState(false);
  const [initialElements, setInitialElements] = useState<readonly ExcalidrawElement[]>([]);
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const applyingRemoteRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!doc) {
      setReady(false);
      setInitialElements([]);
      return;
    }

    const yElements = getPlayRoomExcalidrawElements(doc);
    setInitialElements(yElements.toArray() as ExcalidrawElement[]);
    setReady(true);

    const handleRemote = () => {
      const remote = yElements.toArray() as ExcalidrawElement[];
      const api = apiRef.current;
      if (!api) return;

      const local = api.getSceneElementsIncludingDeleted();
      if (elementsEqual(local, remote)) return;

      applyingRemoteRef.current = true;
      api.updateScene({ elements: remote });
      applyingRemoteRef.current = false;
    };

    yElements.observe(handleRemote);
    return () => {
      yElements.unobserve(handleRemote);
    };
  }, [doc]);

  const pushToYjs = useCallback(
    (elements: readonly ExcalidrawElement[]) => {
      if (!doc || applyingRemoteRef.current) return;

      const yElements = getPlayRoomExcalidrawElements(doc);
      const remote = yElements.toArray();
      if (elementsEqual(elements, remote)) return;

      doc.transact(() => {
        yElements.delete(0, yElements.length);
        if (elements.length > 0) {
          yElements.insert(0, [...elements]);
        }
      }, PLAY_ROOM_KEYS.EXCALIDRAW);
    },
    [doc],
  );

  const onChange = useCallback(
    (elements: readonly ExcalidrawElement[]) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        pushToYjs(elements);
      }, 80);
    },
    [pushToYjs],
  );

  const bindApi = useCallback((api: ExcalidrawImperativeAPI) => {
    apiRef.current = api;
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return { ready, initialElements, onChange, bindApi };
}
