import type * as Y from 'yjs';
import { isScenePointFogged } from './fog';
import { getPlayRoomExcalidrawElements, getPlayRoomExcalidrawFiles, PLAY_ROOM_KEYS, type PlayRoomFileRecord } from './play-room-doc';

const GM_SECRETS_SUFFIX = '::gm-secrets';

export function fogSecretsDocName(roomId: string): string {
  return `${roomId}${GM_SECRETS_SUFFIX}`;
}

export function isFogSecretsDocName(documentName: string): boolean {
  return documentName.endsWith(GM_SECRETS_SUFFIX);
}

export function roomIdFromFogSecretsDocName(documentName: string): string | null {
  if (!isFogSecretsDocName(documentName)) return null;
  return documentName.slice(0, -GM_SECRETS_SUFFIX.length);
}

/** Mirrors just enough of ExcalidrawElement's shape for fog-membership + file-reference checks. */
export interface PositionedElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type?: string;
  fileId?: string | null;
  [key: string]: unknown;
}

function isElementFogged(element: PositionedElement, hiddenCells: ReadonlySet<string>): boolean {
  const centerX = element.x + element.width / 2;
  const centerY = element.y + element.height / 2;
  return isScenePointFogged(centerX, centerY, hiddenCells);
}

function referencedFileIds(elements: readonly PositionedElement[]): Set<string> {
  const ids = new Set<string>();
  for (const element of elements) {
    if (element.type === 'image' && typeof element.fileId === 'string') ids.add(element.fileId);
  }
  return ids;
}

function moveFileRecords(
  fromDoc: Y.Doc,
  fromMap: Y.Map<PlayRoomFileRecord>,
  toDoc: Y.Doc,
  toMap: Y.Map<PlayRoomFileRecord>,
  fileIds: ReadonlySet<string>,
): void {
  if (fileIds.size === 0) return;
  const records: PlayRoomFileRecord[] = [];
  for (const id of fileIds) {
    const record = fromMap.get(id);
    if (record) records.push(record);
  }
  if (records.length === 0) return;

  fromDoc.transact(() => {
    for (const id of fileIds) fromMap.delete(id);
  }, PLAY_ROOM_KEYS.EXCALIDRAW);

  toDoc.transact(() => {
    for (const record of records) toMap.set(record.id, record);
  }, PLAY_ROOM_KEYS.EXCALIDRAW);
}

/**
 * Moves elements (and their referenced files) between the public doc and the
 * GM-only secrets doc based on current fog membership — an element whose
 * center point falls in a hidden cell belongs in secrets; otherwise public.
 *
 * Only ever run by the GM's own client: non-GM clients never load the
 * secrets doc, so anything moved there never reaches their machine at all —
 * unlike the fog overlay, which only hides content visually while the full
 * scene still replicates to every peer.
 *
 * Returns true if anything moved.
 */
export function reconcileFogSecrets(
  publicDoc: Y.Doc,
  secretsDoc: Y.Doc,
  hiddenCells: ReadonlySet<string>,
): boolean {
  const publicElements = getPlayRoomExcalidrawElements(publicDoc);
  const secretElements = getPlayRoomExcalidrawElements(secretsDoc);
  const publicFiles = getPlayRoomExcalidrawFiles(publicDoc);
  const secretFiles = getPlayRoomExcalidrawFiles(secretsDoc);

  const publicArr = publicElements.toArray() as PositionedElement[];
  const secretArr = secretElements.toArray() as PositionedElement[];

  const toHide = publicArr.filter((element) => isElementFogged(element, hiddenCells));
  const toReveal = secretArr.filter((element) => !isElementFogged(element, hiddenCells));

  if (toHide.length === 0 && toReveal.length === 0) return false;

  const hideIds = new Set(toHide.map((element) => element.id));
  const revealIds = new Set(toReveal.map((element) => element.id));

  publicDoc.transact(() => {
    for (let i = publicElements.length - 1; i >= 0; i -= 1) {
      const element = publicElements.get(i) as PositionedElement;
      if (hideIds.has(element.id)) publicElements.delete(i, 1);
    }
    for (const element of toReveal) publicElements.push([element]);
  }, PLAY_ROOM_KEYS.EXCALIDRAW);

  secretsDoc.transact(() => {
    for (let i = secretElements.length - 1; i >= 0; i -= 1) {
      const element = secretElements.get(i) as PositionedElement;
      if (revealIds.has(element.id)) secretElements.delete(i, 1);
    }
    for (const element of toHide) secretElements.push([element]);
  }, PLAY_ROOM_KEYS.EXCALIDRAW);

  moveFileRecords(publicDoc, publicFiles, secretsDoc, secretFiles, referencedFileIds(toHide));
  moveFileRecords(secretsDoc, secretFiles, publicDoc, publicFiles, referencedFileIds(toReveal));

  return true;
}
