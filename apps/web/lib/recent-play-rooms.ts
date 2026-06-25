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

export function renameRecentPlayRoom(id: string, label: string): void {
  const trimmedLabel = label.trim();
  writeRaw(
    readRaw().map((room) =>
      room.id === id ? { ...room, label: trimmedLabel || undefined } : room,
    ),
  );
}
