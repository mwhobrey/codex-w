import type { SavedTag } from '@codex/schemas';
import { and, eq } from 'drizzle-orm';
import type { CodexDb } from './client';
import { savedTags } from './schema';

function rowToSavedTag(row: typeof savedTags.$inferSelect): SavedTag {
  return {
    id: row.id,
    ownerId: row.ownerId,
    label: row.label,
    color: row.color ?? undefined,
    createdAt: row.createdAt.toISOString(),
    lastUsedAt: row.lastUsedAt.toISOString(),
  };
}

export async function listSavedTagsByOwner(db: CodexDb, ownerId: string): Promise<SavedTag[]> {
  const rows = await db.select().from(savedTags).where(eq(savedTags.ownerId, ownerId));
  return rows.map(rowToSavedTag);
}

export async function getSavedTagById(db: CodexDb, id: string): Promise<SavedTag | null> {
  const rows = await db.select().from(savedTags).where(eq(savedTags.id, id)).limit(1);
  const row = rows[0];
  return row ? rowToSavedTag(row) : null;
}

export async function upsertSavedTag(db: CodexDb, tag: SavedTag): Promise<void> {
  await db
    .insert(savedTags)
    .values({
      id: tag.id,
      ownerId: tag.ownerId,
      label: tag.label,
      color: tag.color ?? null,
      createdAt: new Date(tag.createdAt),
      lastUsedAt: new Date(tag.lastUsedAt),
    })
    .onConflictDoUpdate({
      target: savedTags.id,
      set: {
        label: tag.label,
        color: tag.color ?? null,
        lastUsedAt: new Date(tag.lastUsedAt),
      },
    });
}

export async function deleteSavedTag(db: CodexDb, id: string, ownerId: string): Promise<boolean> {
  const rows = await db
    .delete(savedTags)
    .where(and(eq(savedTags.id, id), eq(savedTags.ownerId, ownerId)))
    .returning();

  return rows.length > 0;
}
