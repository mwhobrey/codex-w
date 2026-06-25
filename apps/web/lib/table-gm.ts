import type { TableMeta } from '@codex/schemas';
import type { MapViewRole } from '@/lib/table-systems';

export function isTableGm(meta: TableMeta | null | undefined, ownerId: string): boolean {
  return Boolean(meta?.gmUserId && ownerId && meta.gmUserId === ownerId);
}

/** Fog overlay view: GM may preview player vision; everyone else is always player. */
export function resolveFogViewRole(
  meta: TableMeta | null | undefined,
  ownerId: string,
  gmPreviewAsPlayer: boolean,
): MapViewRole {
  if (!isTableGm(meta, ownerId)) return 'player';
  return gmPreviewAsPlayer ? 'player' : 'gm';
}
