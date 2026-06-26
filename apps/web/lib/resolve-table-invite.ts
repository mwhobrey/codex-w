import { resolveTableInviteToken } from '@codex/sync';
import { findRecentPlayRoomInvite } from '@/lib/recent-play-rooms';
import { readStoredTableInvite } from '@/lib/table-invite-storage';

export function resolvePlayRoomInvite(
  roomId: string,
  urlInvite?: string,
  metaInvite?: string,
): string | undefined {
  return resolveTableInviteToken(
    urlInvite,
    metaInvite,
    readStoredTableInvite(roomId),
    findRecentPlayRoomInvite(roomId),
  );
}
