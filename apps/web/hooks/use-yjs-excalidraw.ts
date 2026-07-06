'use client';

import { getPlayRoomExcalidrawElements, getPlayRoomExcalidrawFiles, isScenePointFogged, PLAY_ROOM_KEYS } from '@codex/sync';
import type { PlayRoomFileRecord } from '@codex/sync';
import { compressImageDataUrl } from '@/lib/compress-image';
import { repairCodexSceneElements } from '@/lib/map-symbols';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import type { BinaryFileData, BinaryFiles, ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import type { CaptureUpdateActionType } from '@excalidraw/excalidraw/store';
import { useCallback, useEffect, useRef, useState } from 'react';
import type * as Y from 'yjs';

const EMPTY_HIDDEN_CELLS: ReadonlySet<string> = new Set();

function elementsEqual(a: readonly ExcalidrawElement[], b: readonly unknown[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    const left = a[i];
    const right = b[i] as ExcalidrawElement | undefined;
    if (!left || !right || left.id !== right.id || left.version !== right.version) return false;
  }
  return true;
}

/**
 * Keeps the highest-version entry per id. Two independent writers can touch
 * this array in close succession (a live onChange push racing a
 * fog-triggered reconcile move) and each reads its own pre-write snapshot,
 * so a stale write can land as a second same-id entry instead of a replace.
 * Self-heals on the next write rather than needing a distributed lock.
 */
function dedupeById(elements: readonly ExcalidrawElement[]): ExcalidrawElement[] {
  const byId = new Map<string, ExcalidrawElement>();
  for (const element of elements) {
    const existing = byId.get(element.id);
    if (!existing || existing.version <= element.version) byId.set(element.id, element);
  }
  return elements.filter((element) => byId.get(element.id) === element);
}

function patchExcalidrawElements(
  doc: Y.Doc,
  yElements: ReturnType<typeof getPlayRoomExcalidrawElements>,
  elements: readonly ExcalidrawElement[],
): void {
  const deduped = dedupeById(elements);
  // Quick pre-check to skip the transact entirely for the common no-op case;
  // the authoritative check happens inside the transaction below.
  if (elementsEqual(deduped, dedupeById(yElements.toArray() as ExcalidrawElement[]))) return;

  doc.transact(() => {
    // Purge any raw duplicate ids directly from the live array by their real
    // indices first. Two writers (e.g. a live onChange push racing a
    // fog-triggered reconcile move) can each read a snapshot before the
    // other's write commits, so a stale diff can land as a genuine second
    // stored entry — not just a duplicate in some computed view. Filtering
    // a *view* wouldn't fix that: the add/update logic below deletes and
    // inserts by index into this same array, so those indices must already
    // match a duplicate-free array before the diff starts.
    const raw = yElements.toArray() as ExcalidrawElement[];
    const bestVersionById = new Map<string, number>();
    for (const element of raw) {
      const best = bestVersionById.get(element.id);
      if (best === undefined || element.version > best) bestVersionById.set(element.id, element.version);
    }
    const keptIds = new Set<string>();
    for (let index = raw.length - 1; index >= 0; index -= 1) {
      const element = raw[index]!;
      if (element.version === bestVersionById.get(element.id) && !keptIds.has(element.id)) {
        keptIds.add(element.id);
      } else {
        yElements.delete(index, 1);
      }
    }

    // Re-read fresh inside the transaction rather than trusting the snapshot
    // taken before this call — once inside the callback nothing else can
    // interleave (JS is single-threaded and Yjs serializes transact calls),
    // so this read is always current and now duplicate-free.
    const remote = yElements.toArray() as ExcalidrawElement[];
    if (elementsEqual(deduped, remote)) return;

    const localIds = new Set(deduped.map((element) => element.id));
    const current = [...remote];

    for (let index = remote.length - 1; index >= 0; index -= 1) {
      if (!localIds.has(remote[index]!.id)) {
        yElements.delete(index, 1);
        current.splice(index, 1);
      }
    }

    deduped.forEach((element, targetIndex) => {
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

function toBinaryFileData(record: PlayRoomFileRecord): BinaryFileData {
  return {
    id: record.id as BinaryFileData['id'],
    mimeType: record.mimeType as BinaryFileData['mimeType'],
    dataURL: record.dataURL as BinaryFileData['dataURL'],
    created: record.created,
  };
}

function isElementHidden(element: ExcalidrawElement, hiddenCells: ReadonlySet<string>): boolean {
  if (hiddenCells.size === 0) return false;
  const centerX = element.x + element.width / 2;
  const centerY = element.y + element.height / 2;
  return isScenePointFogged(centerX, centerY, hiddenCells);
}

function partitionByFog(
  elements: readonly ExcalidrawElement[],
  hiddenCells: ReadonlySet<string>,
): { visible: ExcalidrawElement[]; hidden: ExcalidrawElement[] } {
  const visible: ExcalidrawElement[] = [];
  const hidden: ExcalidrawElement[] = [];
  for (const element of elements) {
    (isElementHidden(element, hiddenCells) ? hidden : visible).push(element);
  }
  return { visible, hidden };
}

export interface UseYjsExcalidrawResult {
  ready: boolean;
  initialElements: readonly ExcalidrawElement[];
  initialFiles: BinaryFileData[];
  onChange: () => void;
  bindApi: (api: ExcalidrawImperativeAPI) => void;
}

/**
 * Syncs an Excalidraw scene to a Yjs doc. When `secretsDoc` is supplied
 * (GM only — see useFogSecretsDoc), elements currently under fog live there
 * instead of the public doc: the GM's own view merges both sources so
 * nothing looks different locally, but non-GM clients (which never load
 * secretsDoc) simply never receive that data. Without `secretsDoc` this
 * behaves exactly as plain public-only sync.
 */
export function useYjsExcalidraw(
  doc: Y.Doc | null,
  secretsDoc: Y.Doc | null = null,
  hiddenCells: ReadonlySet<string> = EMPTY_HIDDEN_CELLS,
): UseYjsExcalidrawResult {
  const [ready, setReady] = useState(false);
  const [initialElements, setInitialElements] = useState<readonly ExcalidrawElement[]>([]);
  const [initialFiles, setInitialFiles] = useState<BinaryFileData[]>([]);
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const applyingRemoteRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const knownFileIdsRef = useRef<Set<string>>(new Set());
  const hiddenCellsRef = useRef(hiddenCells);
  hiddenCellsRef.current = hiddenCells;
  // Latest sync-from-Yjs callbacks, refreshed each time `doc`/`secretsDoc`
  // change so `bindApi` can force a catch-up pull the moment the Excalidraw
  // API mounts — the Yjs observers can fire (and, finding no API yet,
  // no-op) before Excalidraw finishes mounting, and nothing would otherwise
  // ever re-check once the API becomes available.
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
    const ySecretElements = secretsDoc ? getPlayRoomExcalidrawElements(secretsDoc) : null;
    const ySecretFiles = secretsDoc ? getPlayRoomExcalidrawFiles(secretsDoc) : null;

    const mergedElementsNow = (): ExcalidrawElement[] => {
      const pub = yElements.toArray() as ExcalidrawElement[];
      if (!ySecretElements) return pub;
      // An element can transiently exist in both arrays mid-move (reconcile
      // commits the public delete and the secrets insert as two separate
      // transactions) — dedupe so Excalidraw's own scene never receives two
      // copies of the same id, which otherwise compounds through repeated
      // onChange/push cycles.
      return dedupeById([...pub, ...(ySecretElements.toArray() as ExcalidrawElement[])]);
    };

    const mergedFilesNow = (): Map<string, PlayRoomFileRecord> => {
      const map = new Map<string, PlayRoomFileRecord>();
      yFiles.forEach((record, id) => map.set(id, record));
      ySecretFiles?.forEach((record, id) => map.set(id, record));
      return map;
    };

    setInitialElements(repairCodexSceneElements(mergedElementsNow()));
    const initialFilesMap = mergedFilesNow();
    setInitialFiles([...initialFilesMap.values()].map(toBinaryFileData));
    knownFileIdsRef.current = new Set(initialFilesMap.keys());
    setReady(true);

    // Ensures any files an incoming element references are already loaded
    // into Excalidraw before the element itself lands — Excalidraw silently
    // drops/hides image elements whose fileId doesn't resolve to a loaded
    // file at insert time, so file registration must happen first.
    const ensureFilesLoaded = (api: ExcalidrawImperativeAPI, elements: readonly ExcalidrawElement[]) => {
      const needed = referencedFileIds(elements);
      if (needed.size === 0) return;
      const existing = api.getFiles();
      const filesMap = mergedFilesNow();
      const missing = [...needed].filter((id) => !existing[id] && filesMap.has(id));
      if (missing.length === 0) return;
      api.addFiles(missing.map((id) => toBinaryFileData(filesMap.get(id)!)));
      knownFileIdsRef.current = new Set([...knownFileIdsRef.current, ...missing]);
    };

    const handleRemoteElements = () => {
      // No applyingRemoteRef check here: that flag exists to stop
      // onChange/pushToYjs from echoing our own updateScene call back as a
      // local edit — it does NOT protect against missing a second,
      // legitimate remote change. reconcileFogSecrets moves an element via
      // two separate doc.transact calls (delete from public, insert to
      // secrets), each firing this observer synchronously; skipping the
      // second call here would leave the local scene stuck showing the
      // element removed and never re-added. elementsEqual below already
      // makes redundant/no-op calls cheap.
      const remote = repairCodexSceneElements(mergedElementsNow());
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
      const filesMap = mergedFilesNow();
      const newFiles = [...filesMap.entries()]
        .filter(([id]) => !knownFileIdsRef.current.has(id))
        .map(([, record]) => record);
      knownFileIdsRef.current = new Set(filesMap.keys());
      if (newFiles.length > 0) {
        api.addFiles(newFiles.map(toBinaryFileData));
      }
    };

    resyncRef.current = { elements: handleRemoteElements, files: handleRemoteFiles };
    // secretsDoc may connect well after this effect's initial mount (GM
    // status confirms asynchronously) — if the Excalidraw API is already
    // bound by then, catch it up immediately rather than waiting for a
    // bindApi call that already happened.
    handleRemoteFiles();
    handleRemoteElements();

    yElements.observe(handleRemoteElements);
    yFiles.observe(handleRemoteFiles);
    ySecretElements?.observe(handleRemoteElements);
    ySecretFiles?.observe(handleRemoteFiles);
    return () => {
      yElements.unobserve(handleRemoteElements);
      yFiles.unobserve(handleRemoteFiles);
      ySecretElements?.unobserve(handleRemoteElements);
      ySecretFiles?.unobserve(handleRemoteFiles);
      resyncRef.current = null;
    };
  }, [doc, secretsDoc]);

  // Re-reads the API's current scene/files at execution time rather than
  // trusting values captured when the debounce was scheduled — a remote
  // update may have landed during the debounce window (e.g. a peer joining
  // and pulling in synced content), and pushing a stale closure would clobber it.
  // Files are committed before elements so any receiving peer already has
  // referenced image data available when the element lands (see
  // ensureFilesLoaded above). When secretsDoc is present, the scene is
  // partitioned by current fog membership so hidden elements/files land only
  // in the GM-only doc.
  const pushToYjs = useCallback(() => {
    if (!doc || applyingRemoteRef.current) return;
    const api = apiRef.current;
    if (!api) return;
    const repaired = repairCodexSceneElements(api.getSceneElementsIncludingDeleted());
    const files = api.getFiles();

    if (!secretsDoc) {
      void patchExcalidrawFiles(doc, getPlayRoomExcalidrawFiles(doc), files, repaired).then(() => {
        knownFileIdsRef.current = new Set(getPlayRoomExcalidrawFiles(doc).keys());
        patchExcalidrawElements(doc, getPlayRoomExcalidrawElements(doc), repaired);
      });
      return;
    }

    const { visible, hidden } = partitionByFog(repaired, hiddenCellsRef.current);
    void Promise.all([
      patchExcalidrawFiles(doc, getPlayRoomExcalidrawFiles(doc), files, visible),
      patchExcalidrawFiles(secretsDoc, getPlayRoomExcalidrawFiles(secretsDoc), files, hidden),
    ]).then(() => {
      knownFileIdsRef.current = new Set([
        ...getPlayRoomExcalidrawFiles(doc).keys(),
        ...getPlayRoomExcalidrawFiles(secretsDoc).keys(),
      ]);
      patchExcalidrawElements(doc, getPlayRoomExcalidrawElements(doc), visible);
      patchExcalidrawElements(secretsDoc, getPlayRoomExcalidrawElements(secretsDoc), hidden);
    });
  }, [doc, secretsDoc]);

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
