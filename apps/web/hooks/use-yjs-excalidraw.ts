'use client';

import { getPlayRoomExcalidrawElements, getPlayRoomExcalidrawFiles, PLAY_ROOM_KEYS } from '@codex/sync';
import type { PlayRoomFileRecord } from '@codex/sync';
import { compressImageDataUrl } from '@/lib/compress-image';
import { repairCodexSceneElements } from '@/lib/map-symbols';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import type { BinaryFileData, BinaryFiles, ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import type { CaptureUpdateActionType } from '@excalidraw/excalidraw/store';
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

function referencedFileIds(elements: readonly ExcalidrawElement[]): Set<string> {
  const ids = new Set<string>();
  for (const element of elements) {
    if (element.type === 'image' && element.fileId) ids.add(element.fileId);
  }
  return ids;
}

async function patchExcalidrawFiles(
  doc: Y.Doc,
  yFiles: Y.Map<PlayRoomFileRecord>,
  files: BinaryFiles,
  elements: readonly ExcalidrawElement[],
): Promise<void> {
  const referenced = referencedFileIds(elements);

  const toAdd: PlayRoomFileRecord[] = [];
  for (const id of referenced) {
    if (yFiles.has(id)) continue;
    const file = files[id];
    if (!file) continue;
    const compressed = await compressImageDataUrl(file.dataURL, file.mimeType);
    toAdd.push({ id, mimeType: compressed.mimeType, dataURL: compressed.dataUrl, created: file.created });
  }

  doc.transact(() => {
    for (const id of [...yFiles.keys()]) {
      if (!referenced.has(id)) yFiles.delete(id);
    }
    for (const record of toAdd) {
      yFiles.set(record.id, record);
    }
  }, PLAY_ROOM_KEYS.EXCALIDRAW);
}

function filesFromYjs(yFiles: Y.Map<PlayRoomFileRecord>): BinaryFileData[] {
  return [...yFiles.values()].map((record) => ({
    id: record.id as BinaryFileData['id'],
    mimeType: record.mimeType as BinaryFileData['mimeType'],
    dataURL: record.dataURL as BinaryFileData['dataURL'],
    created: record.created,
  }));
}

function toBinaryFileData(record: PlayRoomFileRecord): BinaryFileData {
  return {
    id: record.id as BinaryFileData['id'],
    mimeType: record.mimeType as BinaryFileData['mimeType'],
    dataURL: record.dataURL as BinaryFileData['dataURL'],
    created: record.created,
  };
}

export interface UseYjsExcalidrawResult {
  ready: boolean;
  initialElements: readonly ExcalidrawElement[];
  initialFiles: BinaryFileData[];
  onChange: () => void;
  bindApi: (api: ExcalidrawImperativeAPI) => void;
}

export function useYjsExcalidraw(doc: Y.Doc | null): UseYjsExcalidrawResult {
  const [ready, setReady] = useState(false);
  const [initialElements, setInitialElements] = useState<readonly ExcalidrawElement[]>([]);
  const [initialFiles, setInitialFiles] = useState<BinaryFileData[]>([]);
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const applyingRemoteRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const knownFileIdsRef = useRef<Set<string>>(new Set());
  // Latest sync-from-Yjs callbacks, refreshed each time `doc` changes so
  // `bindApi` can force a catch-up pull the moment the Excalidraw API
  // mounts — the Yjs observers can fire (and, finding no API yet, no-op)
  // before Excalidraw finishes mounting, and nothing would otherwise ever
  // re-check once the API becomes available.
  const resyncRef = useRef<{ elements: () => void; files: () => void } | null>(null);

  useEffect(() => {
    if (!doc) {
      setReady(false);
      setInitialElements([]);
      setInitialFiles([]);
      knownFileIdsRef.current = new Set();
      resyncRef.current = null;
      return;
    }

    const yElements = getPlayRoomExcalidrawElements(doc);
    const yFiles = getPlayRoomExcalidrawFiles(doc);
    setInitialElements(repairCodexSceneElements(yElements.toArray() as ExcalidrawElement[]));
    setInitialFiles(filesFromYjs(yFiles));
    knownFileIdsRef.current = new Set(yFiles.keys());
    setReady(true);

    // Ensures any files an incoming element references are already loaded
    // into Excalidraw before the element itself lands — Excalidraw silently
    // drops/hides image elements whose fileId doesn't resolve to a loaded
    // file at insert time, so file registration must happen first.
    const ensureFilesLoaded = (api: ExcalidrawImperativeAPI, elements: readonly ExcalidrawElement[]) => {
      const needed = referencedFileIds(elements);
      if (needed.size === 0) return;
      const existing = api.getFiles();
      const missing = [...needed].filter((id) => !existing[id] && yFiles.has(id));
      if (missing.length === 0) return;
      api.addFiles(missing.map((id) => toBinaryFileData(yFiles.get(id)!)));
      knownFileIdsRef.current = new Set([...knownFileIdsRef.current, ...missing]);
    };

    const handleRemoteElements = () => {
      if (applyingRemoteRef.current) return;
      const remote = repairCodexSceneElements(yElements.toArray() as ExcalidrawElement[]);
      const api = apiRef.current;
      if (!api) return;

      const local = api.getSceneElementsIncludingDeleted();
      if (elementsEqual(local, remote)) return;

      ensureFilesLoaded(api, remote);

      applyingRemoteRef.current = true;
      // captureUpdate: 'NEVER' — remote updates must not enter the local
      // undo/redo store (see Excalidraw's CaptureUpdateAction docs).
      api.updateScene({ elements: remote, captureUpdate: 'NEVER' as CaptureUpdateActionType });
      setTimeout(() => {
        applyingRemoteRef.current = false;
      }, 0);
    };

    const handleRemoteFiles = () => {
      const api = apiRef.current;
      if (!api) return;
      const newFiles = [...yFiles.entries()]
        .filter(([id]) => !knownFileIdsRef.current.has(id))
        .map(([, record]) => record);
      knownFileIdsRef.current = new Set(yFiles.keys());
      if (newFiles.length > 0) {
        api.addFiles(newFiles.map(toBinaryFileData));
      }
    };

    resyncRef.current = { elements: handleRemoteElements, files: handleRemoteFiles };

    yElements.observe(handleRemoteElements);
    yFiles.observe(handleRemoteFiles);
    return () => {
      yElements.unobserve(handleRemoteElements);
      yFiles.unobserve(handleRemoteFiles);
      resyncRef.current = null;
    };
  }, [doc]);

  // Re-reads the API's current scene/files at execution time rather than
  // trusting values captured when the debounce was scheduled — a remote
  // update may have landed during the debounce window (e.g. a peer joining
  // and pulling in synced content), and pushing a stale closure would clobber it.
  // Files are committed before elements so any receiving peer already has
  // referenced image data available when the element lands (see
  // ensureFilesLoaded above).
  const pushToYjs = useCallback(() => {
    if (!doc || applyingRemoteRef.current) return;
    const api = apiRef.current;
    if (!api) return;
    const repaired = repairCodexSceneElements(api.getSceneElementsIncludingDeleted());
    const files = api.getFiles();
    void patchExcalidrawFiles(doc, getPlayRoomExcalidrawFiles(doc), files, repaired).then(() => {
      knownFileIdsRef.current = new Set(getPlayRoomExcalidrawFiles(doc).keys());
      patchExcalidrawElements(doc, getPlayRoomExcalidrawElements(doc), repaired);
    });
  }, [doc]);

  const onChange = useCallback(() => {
    if (applyingRemoteRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      pushToYjs();
    }, 120);
  }, [pushToYjs]);

  const bindApi = useCallback((api: ExcalidrawImperativeAPI) => {
    apiRef.current = api;
    // Excalidraw resolves its own `initialData` (which may itself be a
    // Promise) asynchronously right after mount; racing our catch-up sync
    // against that resolution means whichever finishes last wins, and
    // Excalidraw's own resolution can clobber ours. Deferring past that
    // settles the race reliably.
    setTimeout(() => {
      resyncRef.current?.files();
      resyncRef.current?.elements();
    }, 50);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return { ready, initialElements, initialFiles, onChange, bindApi };
}
