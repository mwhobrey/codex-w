import type { CharacterSheet, GameSystemId } from '@codex/schemas';
import { and, eq } from 'drizzle-orm';
import type { CodexDb } from './client';
import { characterSheets } from './schema';

function rowToSheet(row: typeof characterSheets.$inferSelect): CharacterSheet {
  return {
    id: row.id,
    name: row.name,
    gameSystemId: row.gameSystemId,
    ownerId: row.ownerId,
    fields: row.fields,
    originSystemId: (row.originSystemId as GameSystemId | null) ?? undefined,
    lineageSheetId: row.lineageSheetId ?? undefined,
    portraitUrl: row.portraitUrl ?? undefined,
    layout: row.layout ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listCharacterSheetsByOwner(
  db: CodexDb,
  ownerId: string,
): Promise<CharacterSheet[]> {
  const rows = await db
    .select()
    .from(characterSheets)
    .where(eq(characterSheets.ownerId, ownerId));
  return rows.map(rowToSheet);
}

export async function getCharacterSheetById(
  db: CodexDb,
  id: string,
): Promise<CharacterSheet | null> {
  const rows = await db.select().from(characterSheets).where(eq(characterSheets.id, id)).limit(1);
  const row = rows[0];
  return row ? rowToSheet(row) : null;
}

export async function upsertCharacterSheet(db: CodexDb, sheet: CharacterSheet): Promise<void> {
  await db
    .insert(characterSheets)
    .values({
      id: sheet.id,
      ownerId: sheet.ownerId,
      name: sheet.name,
      gameSystemId: sheet.gameSystemId,
      fields: sheet.fields,
      originSystemId: sheet.originSystemId ?? null,
      lineageSheetId: sheet.lineageSheetId ?? null,
      portraitUrl: sheet.portraitUrl ?? null,
      layout: sheet.layout ?? null,
      createdAt: new Date(sheet.createdAt),
      updatedAt: new Date(sheet.updatedAt),
    })
    .onConflictDoUpdate({
      target: characterSheets.id,
      set: {
        name: sheet.name,
        gameSystemId: sheet.gameSystemId,
        fields: sheet.fields,
        originSystemId: sheet.originSystemId ?? null,
        lineageSheetId: sheet.lineageSheetId ?? null,
        portraitUrl: sheet.portraitUrl ?? null,
        layout: sheet.layout ?? null,
        updatedAt: new Date(sheet.updatedAt),
      },
    });
}

export async function deleteCharacterSheet(db: CodexDb, id: string, ownerId: string): Promise<boolean> {
  const existing = await getCharacterSheetById(db, id);
  if (!existing || existing.ownerId !== ownerId) return false;

  await db
    .delete(characterSheets)
    .where(and(eq(characterSheets.id, id), eq(characterSheets.ownerId, ownerId)));

  return true;
}
