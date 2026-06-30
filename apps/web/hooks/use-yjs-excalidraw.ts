'use client';

import { getPlayRoomExcalidrawElements, PLAY_ROOM_KEYS } from '@codex/sync';
import { repairCodexSceneElements } from '@/lib/map-symbols';
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

function patchExcalidrawElements(
  doc: Y.Doc,
  yElements: ReturnType<typeof getPlayRoomExcalidrawElements>,
  elements: readonly ExcalidrawElement[],
): void {
  const remote = yElements.toArray() as ExcalidrawElement[];
  if (elementsEqual(elements, remote)) return;

  doc.transact(() => {
    const localIds = new Set(elements.map((element) => element.id));
    const current = [...remote];

    for (let index = remote.length - 1; index >= 0; index -= 1) {
      if (!localIds.has(remote[index]!.id)) {
        yElements.delete(index, 1);
        current.splice(index, 1);
      }
    }

    elements.forEach((element, targetIndex) => {
      const existingIndex = current.findIndex((item) => item.id === element.id);
      if (existingIndex === -1) {
        const insertIndex = Math.min(targetIndex, current.length);
        yElements.insert(insertIndex, [element]);
        current.splice(insertIndex, 0, element);
      } else {
        const existing = current[existingIndex]!;
        if (existing.version !== element.version || existingIndex !== targetIndex) {
          yElements.delete(existingIndex, 1);
          current.splice(existingIndex, 1);

          const insertIndex = Math.min(targetIndex, current.length);
          yElements.insert(insertIndex, [element]);
          current.splice(insertIndex, 0, element);
        }
      }
    });
  }, PLAY_ROOM_KEYS.EXCALIDRAW);
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
    setInitialElements(repairCodexSceneElements(yElements.toArray() as ExcalidrawElement[]));
    setReady(true);

    const handleRemote = () => {
      if (applyingRemoteRef.current) return;
      const remote = repairCodexSceneElements(yElements.toArray() as ExcalidrawElement[]);
      const api = apiRef.current;
      if (!api) return;

      const local = api.getSceneElementsIncludingDeleted();
      if (elementsEqual(local, remote)) return;

      applyingRemoteRef.current = true;
      api.updateScene({ elements: remote });
      queueMicrotask(() => {
        applyingRemoteRef.current = false;
      });
    };

    yElements.observe(handleRemote);
    return () => {
      yElements.unobserve(handleRemote);
    };
  }, [doc]);

  const pushToYjs = useCallback(
    (elements: readonly ExcalidrawElement[]) => {
      if (!doc || applyingRemoteRef.current) return;
      patchExcalidrawElements(
        doc,
        getPlayRoomExcalidrawElements(doc),
        repairCodexSceneElements(elements),
      );
    },
    [doc],
  );

  const onChange = useCallback(
    (elements: readonly ExcalidrawElement[]) => {
      if (applyingRemoteRef.current) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        pushToYjs(elements);
      }, 120);
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
