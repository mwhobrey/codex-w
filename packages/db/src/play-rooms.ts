import type { PlayRoom } from '@codex/schemas';
import { and, desc, eq } from 'drizzle-orm';
import type { CodexDb } from './client';
import { playRooms } from './schema';

function rowToPlayRoom(row: typeof playRooms.$inferSelect): PlayRoom {
  return {
    roomId: row.roomId,
    ownerId: row.ownerId,
    name: row.name ?? undefined,
    gameSystemId: (row.gameSystemId as PlayRoom['gameSystemId']) ?? undefined,
    inviteToken: row.inviteToken ?? undefined,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listPlayRoomsByOwner(db: CodexDb, ownerId: string): Promise<PlayRoom[]> {
  const rows = await db
    .select()
    .from(playRooms)
    .where(eq(playRooms.ownerId, ownerId))
    .orderBy(desc(playRooms.updatedAt));
  return rows.map(rowToPlayRoom);
}

export async function getPlayRoomById(db: CodexDb, roomId: string): Promise<PlayRoom | null> {
  const rows = await db.select().from(playRooms).where(eq(playRooms.roomId, roomId)).limit(1);
  return rows[0] ? rowToPlayRoom(rows[0]) : null;
}

export async function upsertPlayRoom(db: CodexDb, room: PlayRoom): Promise<void> {
  const updatedAt = new Date(room.updatedAt);
  await db
    .insert(playRooms)
    .values({
      roomId: room.roomId,
      ownerId: room.ownerId,
      name: room.name ?? null,
      gameSystemId: room.gameSystemId ?? null,
      inviteToken: room.inviteToken ?? null,
      updatedAt,
    })
    .onConflictDoUpdate({
      target: playRooms.roomId,
      set: {
        ownerId: room.ownerId,
        name: room.name ?? null,
        gameSystemId: room.gameSystemId ?? null,
        inviteToken: room.inviteToken ?? null,
        updatedAt,
      },
    });
}

export async function deletePlayRoom(db: CodexDb, roomId: string, ownerId: string): Promise<boolean> {
  const rows = await db
    .delete(playRooms)
    .where(and(eq(playRooms.roomId, roomId), eq(playRooms.ownerId, ownerId)))
    .returning();
  return rows.length > 0;
}
