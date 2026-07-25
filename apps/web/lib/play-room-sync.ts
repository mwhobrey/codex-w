import type { PlayRoom } from '@codex/schemas';
import { pushOrEnqueue } from '@/lib/push-or-enqueue';

export async function pushPlayRoomSync(room: PlayRoom): Promise<{ synced: boolean }> {
  const url = `/api/rooms/${encodeURIComponent(room.roomId)}`;
  return pushOrEnqueue({
    request: () =>
      fetch(url, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(room),
      }),
    dedupeKey: `play-room:${room.roomId}`,
    entity: 'play-room',
    method: 'PUT',
    url,
    body: room,
  });
}
