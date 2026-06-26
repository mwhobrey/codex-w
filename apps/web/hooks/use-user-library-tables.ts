'use client';

import { userLibraryTableRepo } from '@codex/sync';
import type { UserLibraryTable } from '@codex/schemas';
import { useLiveQuery } from 'dexie-react-hooks';
import { useOwnerId } from '@/hooks/use-owner-id';

export function useUserLibraryTables(): {
  tables: UserLibraryTable[] | undefined;
  ownerId: string;
  ready: boolean;
} {
  const { ownerId, ready } = useOwnerId();
  const tables = useLiveQuery(
    () => (ready ? userLibraryTableRepo.listByOwner(ownerId) : []),
    [ownerId, ready],
  );

  return { tables, ownerId, ready };
}
