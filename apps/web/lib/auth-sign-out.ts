import { signOut } from '@/lib/auth-client';
import { stripInviteTokensFromRecentPlayRooms } from '@/lib/recent-play-rooms';
import { characterPortraitRepo } from '@codex/sync';

/** Sign out and clear sensitive local data (invite tokens in recent tables). */
export async function signOutWithLocalCleanup(): Promise<void> {
  stripInviteTokensFromRecentPlayRooms();
  characterPortraitRepo.clearObjectUrlCache();
  await signOut();
}

