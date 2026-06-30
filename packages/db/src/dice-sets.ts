import type { DiceSet } from '@codex/schemas';
import { and, eq } from 'drizzle-orm';
import type { CodexDb } from './client';
import { diceSets } from './schema';

function rowToDiceSet(row: typeof diceSets.$inferSelect): DiceSet {
  return {
    id: row.id,
    ownerId: row.ownerId,
    name: row.name,
    formulas: row.formulas,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listDiceSetsByOwner(db: CodexDb, ownerId: string): Promise<DiceSet[]> {
  const rows = await db.select().from(diceSets).where(eq(diceSets.ownerId, ownerId));
  return rows.map(rowToDiceSet);
}

export async function getDiceSetById(db: CodexDb, id: string): Promise<DiceSet | null> {
  const rows = await db.select().from(diceSets).where(eq(diceSets.id, id)).limit(1);
  const row = rows[0];
  return row ? rowToDiceSet(row) : null;
}

export async function upsertDiceSet(db: CodexDb, set: DiceSet): Promise<void> {
  await db
    .insert(diceSets)
    .values({
      id: set.id,
      ownerId: set.ownerId,
      name: set.name,
      formulas: set.formulas,
      createdAt: new Date(set.createdAt),
      updatedAt: new Date(set.updatedAt),
    })
    .onConflictDoUpdate({
      target: diceSets.id,
      set: {
        name: set.name,
        formulas: set.formulas,
        updatedAt: new Date(set.updatedAt),
      },
    });
}

export async function deleteDiceSet(db: CodexDb, id: string, ownerId: string): Promise<boolean> {
  const rows = await db
    .delete(diceSets)
    .where(and(eq(diceSets.id, id), eq(diceSets.ownerId, ownerId)))
    .returning();

  return rows.length > 0;
}
