import { describe, expect, it, beforeEach } from 'vitest';
import {
  clearMemoryInvitesForTests,
  getRoomInvite,
  seedRoomInvite,
} from './invite-store.js';

describe('invite-store (memory fallback)', () => {
  beforeEach(() => {
    clearMemoryInvitesForTests();
    delete process.env.DATABASE_URL;
  });

  it('seeds and retrieves invites', async () => {
    expect(await seedRoomInvite('room-a', 'token-abcdefgh')).toBe('seeded');
    expect(await getRoomInvite('room-a')).toBe('token-abcdefgh');
    expect(await seedRoomInvite('room-a', 'token-abcdefgh')).toBe('already');
    expect(await seedRoomInvite('room-a', 'other-token-xyz')).toBe('conflict');
  });
});
