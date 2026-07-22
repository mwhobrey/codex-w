import type { CodexDb } from './client';
import { eq } from 'drizzle-orm';
import { roomInvites } from './schema';

export async function getRoomInviteToken(db: CodexDb, roomId: string): Promise<string | null> {
  const rows = await db.select().from(roomInvites).where(eq(roomInvites.roomId, roomId)).limit(1);
  return rows[0]?.token ?? null;
}

export type SeedRoomInviteResult = 'seeded' | 'already' | 'conflict';

export async function seedRoomInviteToken(
  db: CodexDb,
  roomId: string,
  token: string,
): Promise<SeedRoomInviteResult> {
  const existing = await getRoomInviteToken(db, roomId);
  if (existing) {
    return existing === token ? 'already' : 'conflict';
  }

  await db.insert(roomInvites).values({
    roomId,
    token,
    updatedAt: new Date(),
  });
  return 'seeded';
}
