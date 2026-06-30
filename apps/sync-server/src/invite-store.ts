/** In-memory invite tokens per play room (survives until process restart). */
const roomInvites = new Map<string, string>();

export function getRoomInvite(roomId: string): string | null {
  return roomInvites.get(roomId) ?? null;
}

export function seedRoomInvite(roomId: string, inviteToken: string): 'seeded' | 'already' | 'conflict' {
  const existing = roomInvites.get(roomId);
  if (existing) {
    return existing === inviteToken ? 'already' : 'conflict';
  }
  roomInvites.set(roomId, inviteToken);
  return 'seeded';
}
