import { TableMetaSchema, type GameSystemId, type TableMeta } from '@codex/schemas';
import type * as Y from 'yjs';
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
    yMeta.clear();
    for (const [key, value] of Object.entries(parsed)) {
      if (value !== undefined) yMeta.set(key, value);
    }
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
): TableMeta {
  const yMeta = getPlayRoomMetaMap(doc);
  if (yMeta.size > 0) return readTableMeta(doc);
  return writeTableMeta(doc, { ...defaultTableMeta(gameSystemId), name });
}
