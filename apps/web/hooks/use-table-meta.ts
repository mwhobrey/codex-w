'use client';

import type { GameSystemId, TableMeta } from '@codex/schemas';
import {
  getPlayRoomMetaMap,
  patchTableMeta,
  readTableMeta,
  seedTableMetaIfEmpty,
} from '@codex/sync';
import { useCallback, useEffect, useState } from 'react';
import type * as Y from 'yjs';

export function useTableMeta(
  doc: Y.Doc | null,
  options?: { initialSystem?: GameSystemId; tableName?: string; initialInviteToken?: string },
) {
  const [meta, setMeta] = useState<TableMeta | null>(null);

  useEffect(() => {
    if (!doc) {
      setMeta(null);
      return;
    }

    const yMeta = getPlayRoomMetaMap(doc);
    const sync = () => setMeta(readTableMeta(doc));

    if (yMeta.size === 0 && options?.initialSystem) {
      seedTableMetaIfEmpty(
        doc,
        options.initialSystem,
        options.tableName,
        undefined,
        options.initialInviteToken,
      );
    }

    sync();
    yMeta.observe(sync);
    return () => yMeta.unobserve(sync);
  }, [doc, options?.initialInviteToken, options?.initialSystem, options?.tableName]);

  const updateMeta = useCallback(
    (patch: Partial<TableMeta>) => {
      if (!doc) return null;
      const next = patchTableMeta(doc, patch);
      setMeta(next);
      return next;
    },
    [doc],
  );

  return { meta, updateMeta };
}
