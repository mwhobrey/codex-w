import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import {
  readRecentPlayRooms,
  recordRecentPlayRoom,
  stripInviteTokensFromRecentPlayRooms,
  mergeCloudPlayRooms,
} from './recent-play-rooms';

describe('recent play rooms', () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('strips invite tokens but keeps table metadata on sign-out cleanup', () => {
    recordRecentPlayRoom('abc123', 'Camp table', 'snallygaster', 'secret-invite-token-12345678');
    stripInviteTokensFromRecentPlayRooms();

    const recent = readRecentPlayRooms();
    expect(recent).toHaveLength(1);
    expect(recent[0]?.id).toBe('abc123');
    expect(recent[0]?.label).toBe('Camp table');
    expect(recent[0]?.gameSystemId).toBe('snallygaster');
    expect(recent[0]?.inviteToken).toBeUndefined();
  });

  it('merges cloud play rooms into recent list with invites', () => {
    recordRecentPlayRoom('local-only', 'Local', 'generic');
    mergeCloudPlayRooms([
      {
        roomId: 'cloud-room',
        name: 'Laptop harvest',
        gameSystemId: 'muscadines',
        inviteToken: 'cloud-invite-token-ok',
        updatedAt: '2026-07-22T12:00:00.000Z',
      },
    ]);

    const recent = readRecentPlayRooms();
    expect(recent.some((r) => r.id === 'cloud-room')).toBe(true);
    const cloud = recent.find((r) => r.id === 'cloud-room');
    expect(cloud?.label).toBe('Laptop harvest');
    expect(cloud?.inviteToken).toBe('cloud-invite-token-ok');
    expect(cloud?.gameSystemId).toBe('muscadines');
  });
});
