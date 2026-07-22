import type { GameSystemId } from '@codex/schemas';

const STORAGE_KEY = 'codex-recent-play-rooms';
const MAX_RECENT = 12;

export interface RecentPlayRoom {
  id: string;
  label?: string;
  gameSystemId?: GameSystemId;
  inviteToken?: string;
  visitedAt: string;
}

function readRaw(): RecentPlayRoom[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentPlayRoom[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRaw(rooms: RecentPlayRoom[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms.slice(0, MAX_RECENT)));
}

export function readRecentPlayRooms(): RecentPlayRoom[] {
  return readRaw().sort((a, b) => b.visitedAt.localeCompare(a.visitedAt));
}

export function findRecentPlayRoomInvite(roomId: string): string | undefined {
  const trimmed = roomId.trim();
  if (!trimmed) return undefined;
  return readRaw().find((room) => room.id === trimmed)?.inviteToken?.trim() || undefined;
}

export function recordRecentPlayRoom(
  id: string,
  label?: string,
  gameSystemId?: GameSystemId,
  inviteToken?: string,
): void {
  const trimmed = id.trim();
  if (!trimmed) return;
  const now = new Date().toISOString();
  const existing = readRaw().filter((room) => room.id !== trimmed);
  const prev = readRaw().find((room) => room.id === trimmed);
  const next: RecentPlayRoom = {
    id: trimmed,
    label: label?.trim() || prev?.label,
    gameSystemId: gameSystemId ?? prev?.gameSystemId,
    inviteToken: inviteToken?.trim() || prev?.inviteToken,
    visitedAt: now,
  };
  writeRaw([next, ...existing]);
}

export function removeRecentPlayRoom(id: string): void {
  writeRaw(readRaw().filter((room) => room.id !== id));
}

/** Remove invite tokens from recent rooms (e.g. on sign-out) while keeping names for convenience. */
export function stripInviteTokensFromRecentPlayRooms(): void {
  writeRaw(
    readRaw().map((room) => ({
      ...room,
      inviteToken: undefined,
    })),
  );
}

export function renameRecentPlayRoom(id: string, label: string): void {
  const trimmedLabel = label.trim();
  writeRaw(
    readRaw().map((room) =>
      room.id === id ? { ...room, label: trimmedLabel || undefined } : room,
    ),
  );
}

/**
 * Merge account-owned cloud rooms into local recent list (cross-device lobby).
 * Cloud rooms win on invite/label/system when present; visitedAt uses cloud updatedAt.
 */
export function mergeCloudPlayRooms(
  rooms: Array<{
    roomId: string;
    name?: string;
    gameSystemId?: GameSystemId;
    inviteToken?: string;
    updatedAt: string;
  }>,
): RecentPlayRoom[] {
  if (typeof window === 'undefined' || rooms.length === 0) {
    return readRecentPlayRooms();
  }

  let next = readRaw();
  for (const room of rooms) {
    const id = room.roomId.trim();
    if (!id) continue;
    const existing = next.find((r) => r.id === id);
    const merged: RecentPlayRoom = {
      id,
      label: room.name?.trim() || existing?.label,
      gameSystemId: room.gameSystemId ?? existing?.gameSystemId,
      inviteToken: room.inviteToken?.trim() || existing?.inviteToken,
      visitedAt: room.updatedAt || existing?.visitedAt || new Date().toISOString(),
    };
    next = [merged, ...next.filter((r) => r.id !== id)];
  }
  writeRaw(next.slice(0, MAX_RECENT));
  return readRecentPlayRooms();
}
