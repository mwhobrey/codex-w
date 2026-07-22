import type { PlayRoom } from '@codex/schemas';

export async function queuePlayRoomSync(room: PlayRoom): Promise<{ synced: boolean }> {
  try {
    const res = await fetch(`/api/rooms/${encodeURIComponent(room.roomId)}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(room),
    });

    if (res.status === 401 || res.status === 503) {
      return { synced: false };
    }

    if (!res.ok) {
      return { synced: false };
    }

    const data = (await res.json()) as { synced?: boolean };
    return { synced: data.synced === true };
  } catch {
    return { synced: false };
  }
}
