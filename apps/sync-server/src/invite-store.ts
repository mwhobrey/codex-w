/**
 * Invite tokens per play room.
 * Uses Postgres when DATABASE_URL is set; otherwise in-memory (dev fallback).
 */
import {
  getDb,
  getRoomInviteToken,
  isDatabaseConfigured,
  seedRoomInviteToken,
  type SeedRoomInviteResult,
} from '@codex/db';

const memoryInvites = new Map<string, string>();

export async function getRoomInvite(roomId: string): Promise<string | null> {
  if (isDatabaseConfigured()) {
    try {
      return await getRoomInviteToken(getDb(), roomId);
    } catch (error) {
      console.error('[sync-server] getRoomInvite failed; falling back to memory', error);
    }
  }
  return memoryInvites.get(roomId) ?? null;
}

export async function seedRoomInvite(
  roomId: string,
  inviteToken: string,
): Promise<SeedRoomInviteResult> {
  if (isDatabaseConfigured()) {
    try {
      const result = await seedRoomInviteToken(getDb(), roomId, inviteToken);
      // Keep memory warm for this process so auth stays fast after seed.
      if (result === 'seeded' || result === 'already') {
        memoryInvites.set(roomId, inviteToken);
      }
      return result;
    } catch (error) {
      console.error('[sync-server] seedRoomInvite DB failed; using memory', error);
    }
  }

  const existing = memoryInvites.get(roomId);
  if (existing) {
    return existing === inviteToken ? 'already' : 'conflict';
  }
  memoryInvites.set(roomId, inviteToken);
  return 'seeded';
}

/** Test helper — clear in-memory map only. */
export function clearMemoryInvitesForTests(): void {
  memoryInvites.clear();
}
