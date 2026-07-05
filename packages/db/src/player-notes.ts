import type { PlayerNote } from '@codex/schemas';
import { and, eq } from 'drizzle-orm';
import type { CodexDb } from './client';
import { playerNotes } from './schema';

function rowToPlayerNote(row: typeof playerNotes.$inferSelect): PlayerNote {
  return {
    id: row.id,
    ownerId: row.ownerId,
    roomId: row.roomId,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listPlayerNotesByOwner(db: CodexDb, ownerId: string): Promise<PlayerNote[]> {
  const rows = await db.select().from(playerNotes).where(eq(playerNotes.ownerId, ownerId));
  return rows.map(rowToPlayerNote);
}

export async function listPlayerNotesByRoom(
  db: CodexDb,
  ownerId: string,
  roomId: string,
): Promise<PlayerNote[]> {
  const rows = await db
    .select()
    .from(playerNotes)
    .where(and(eq(playerNotes.ownerId, ownerId), eq(playerNotes.roomId, roomId)));
  return rows.map(rowToPlayerNote);
}

export async function appendPlayerNote(db: CodexDb, note: PlayerNote): Promise<void> {
  await db
    .insert(playerNotes)
    .values({
      id: note.id,
      ownerId: note.ownerId,
      roomId: note.roomId,
      content: note.content,
      createdAt: new Date(note.createdAt),
    })
    .onConflictDoNothing();
}

export async function deletePlayerNote(db: CodexDb, id: string, ownerId: string): Promise<boolean> {
  const rows = await db
    .delete(playerNotes)
    .where(and(eq(playerNotes.id, id), eq(playerNotes.ownerId, ownerId)))
    .returning();

  return rows.length > 0;
}
