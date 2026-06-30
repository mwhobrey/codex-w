import { GameSystemIdSchema, type UserLibraryTable } from '@codex/schemas';
import { and, eq } from 'drizzle-orm';
import type { CodexDb } from './client';
import { libraryTables } from './schema';

function rowToLibraryTable(row: typeof libraryTables.$inferSelect): UserLibraryTable {
  const systemId = row.systemId ? GameSystemIdSchema.safeParse(row.systemId) : undefined;
  return {
    id: row.id,
    ownerId: row.ownerId,
    name: row.name,
    systemId: systemId?.success ? systemId.data : undefined,
    category: row.category as UserLibraryTable['category'],
    description: row.description ?? undefined,
    rows: row.rows,
    sourceTemplateId: row.sourceTemplateId ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listLibraryTablesByOwner(
  db: CodexDb,
  ownerId: string,
): Promise<UserLibraryTable[]> {
  const rows = await db.select().from(libraryTables).where(eq(libraryTables.ownerId, ownerId));
  return rows.map(rowToLibraryTable);
}

export async function getLibraryTableById(
  db: CodexDb,
  id: string,
): Promise<UserLibraryTable | null> {
  const rows = await db.select().from(libraryTables).where(eq(libraryTables.id, id)).limit(1);
  const row = rows[0];
  return row ? rowToLibraryTable(row) : null;
}

export async function upsertLibraryTable(db: CodexDb, table: UserLibraryTable): Promise<void> {
  await db
    .insert(libraryTables)
    .values({
      id: table.id,
      ownerId: table.ownerId,
      name: table.name,
      systemId: table.systemId ?? null,
      category: table.category,
      description: table.description ?? null,
      rows: table.rows,
      sourceTemplateId: table.sourceTemplateId ?? null,
      createdAt: new Date(table.createdAt),
      updatedAt: new Date(table.updatedAt),
    })
    .onConflictDoUpdate({
      target: libraryTables.id,
      set: {
        name: table.name,
        systemId: table.systemId ?? null,
        category: table.category,
        description: table.description ?? null,
        rows: table.rows,
        sourceTemplateId: table.sourceTemplateId ?? null,
        updatedAt: new Date(table.updatedAt),
      },
    });
}

export async function deleteLibraryTable(
  db: CodexDb,
  id: string,
  ownerId: string,
): Promise<boolean> {
  const rows = await db
    .delete(libraryTables)
    .where(and(eq(libraryTables.id, id), eq(libraryTables.ownerId, ownerId)))
    .returning();

  return rows.length > 0;
}
