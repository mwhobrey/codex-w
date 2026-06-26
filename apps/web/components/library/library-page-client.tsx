'use client';

import type { LibraryEntry } from '@codex/game-systems';
import type { UserLibraryTable } from '@codex/schemas';
import { userLibraryTableRepo } from '@codex/sync';
import { cloneLibraryEntryToUserTable, createEmptyUserLibraryTable } from '@/lib/clone-library-table';
import { queueLibraryTableSync } from '@/lib/library-table-sync';
import { useUserLibraryTables } from '@/hooks/use-user-library-tables';
import { LibraryBrowser } from '@/components/library/library-browser';

interface LibraryPageClientProps {
  referenceEntries: LibraryEntry[];
}

export function LibraryPageClient({ referenceEntries }: LibraryPageClientProps) {
  const { tables, ownerId, ready } = useUserLibraryTables();

  const handleCloneReference = async (entry: LibraryEntry) => {
    const created = cloneLibraryEntryToUserTable(entry, ownerId);
    await userLibraryTableRepo.save(created);
    void queueLibraryTableSync(created);
    return created.id;
  };

  const handleCreateEmpty = async () => {
    const created = createEmptyUserLibraryTable(ownerId, 'Custom table');
    await userLibraryTableRepo.save(created);
    void queueLibraryTableSync(created);
    return created.id;
  };

  const handleSaveTable = async (table: UserLibraryTable) => {
    const updated = { ...table, updatedAt: new Date().toISOString() };
    await userLibraryTableRepo.save(updated);
    void queueLibraryTableSync(updated);
  };

  const handleDeleteTable = async (id: string) => {
    await userLibraryTableRepo.delete(id);
    try {
      await fetch(`/api/library-tables/${id}`, { method: 'DELETE', credentials: 'include' });
    } catch {
      // Local-first — cloud delete is best-effort.
    }
  };

  return (
    <LibraryBrowser
      referenceEntries={referenceEntries}
      userTables={tables}
      userTablesReady={ready}
      onCloneReference={handleCloneReference}
      onCreateEmpty={handleCreateEmpty}
      onSaveUserTable={handleSaveTable}
      onDeleteUserTable={handleDeleteTable}
    />
  );
}
