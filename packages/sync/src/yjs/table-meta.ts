import { TableMetaSchema, type GameSystemId, type TableMeta } from '@codex/schemas';
import type * as Y from 'yjs';
import { isValidInviteToken } from '../room-invite';
import { getPlayRoomMetaMap, PLAY_ROOM_KEYS } from './play-room-doc';

export function defaultTableMeta(gameSystemId: GameSystemId = 'generic'): TableMeta {
  return TableMetaSchema.parse({ gameSystemId });
}

export function parseTableMeta(raw: Record<string, unknown>): TableMeta {
  return TableMetaSchema.parse({
    gameSystemId: 'generic',
    ...raw,
  });
}

export function readTableMeta(doc: Y.Doc): TableMeta {
  const yMeta = getPlayRoomMetaMap(doc);
  const raw: Record<string, unknown> = {};
  yMeta.forEach((value, key) => {
    raw[key] = value;
  });
  if (yMeta.size === 0) return defaultTableMeta();
  return parseTableMeta(raw);
}

export function writeTableMeta(doc: Y.Doc, meta: TableMeta): TableMeta {
  const parsed = TableMetaSchema.parse(meta);
  const yMeta = getPlayRoomMetaMap(doc);
  doc.transact(() => {
    const nextKeys = new Set<string>();
    for (const [key, value] of Object.entries(parsed)) {
      if (value === undefined) continue;
      nextKeys.add(key);
      if (yMeta.get(key) !== value) {
        yMeta.set(key, value);
      }
    }
    yMeta.forEach((_value, key) => {
      if (!nextKeys.has(key)) yMeta.delete(key);
    });
  }, PLAY_ROOM_KEYS.META);
  return parsed;
}

export function patchTableMeta(doc: Y.Doc, patch: Partial<TableMeta>): TableMeta {
  const next = TableMetaSchema.parse({
    ...readTableMeta(doc),
    ...patch,
  });
  return writeTableMeta(doc, next);
}

export function seedTableMetaIfEmpty(
  doc: Y.Doc,
  gameSystemId: GameSystemId,
  name?: string,
  gmUserId?: string,
  inviteToken?: string,
): TableMeta {
  const yMeta = getPlayRoomMetaMap(doc);
  if (yMeta.has('gameSystemId')) return readTableMeta(doc);

  const current = yMeta.size > 0 ? readTableMeta(doc) : null;
  return writeTableMeta(doc, {
    ...defaultTableMeta(gameSystemId),
    ...(current ?? {}),
    gameSystemId,
    name: name ?? current?.name,
    gmUserId: gmUserId ?? current?.gmUserId,
    inviteToken: isValidInviteToken(inviteToken)
      ? inviteToken!.trim()
      : current?.inviteToken,
  });
}

/** Persist invite token in meta when the table has none yet (creator URL seed). */
export function ensureTableInviteToken(doc: Y.Doc, inviteToken: string): TableMeta {
  if (!isValidInviteToken(inviteToken)) return readTableMeta(doc);

  const yMeta = getPlayRoomMetaMap(doc);
  // Avoid materializing default generic meta before the play room seeds gameSystemId.
  if (yMeta.size === 0) return readTableMeta(doc);

  const meta = readTableMeta(doc);
  if (meta.inviteToken) return meta;
  return patchTableMeta(doc, { inviteToken: inviteToken.trim() });
}

/** First client to claim when vacant becomes GM (creator / first joiner). */
export function claimTableGmIfVacant(doc: Y.Doc, userId: string): TableMeta {
  const meta = readTableMeta(doc);
  if (meta.gmUserId || !userId.trim()) return meta;
  return patchTableMeta(doc, { gmUserId: userId.trim() });
}

export function transferTableGm(
  doc: Y.Doc,
  fromUserId: string,
  toUserId: string,
): TableMeta | null {
  const meta = readTableMeta(doc);
  const to = toUserId.trim();
  if (!meta.gmUserId || meta.gmUserId !== fromUserId || !to || to === fromUserId) return null;
  return patchTableMeta(doc, { gmUserId: to });
}
