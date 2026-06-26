import { describe, expect, it } from 'vitest';
import { buildPlayRoomPath, createPlayRoomUrl, parseTableInviteInput } from './play-room';

describe('buildPlayRoomPath', () => {
  it('builds path with system and invite', () => {
    expect(
      buildPlayRoomPath('abc123', { gameSystemId: 'loner', inviteToken: 'tokentokentoken' }),
    ).toBe('/play/abc123?system=loner&invite=tokentokentoken');
  });

  it('builds bare path', () => {
    expect(buildPlayRoomPath('abc123')).toBe('/play/abc123');
  });
});

describe('parseTableInviteInput', () => {
  it('parses full invite URL', () => {
    const result = parseTableInviteInput(
      'https://example.com/play/room123?system=loner&invite=abcdefghijklmnop',
    );
    expect(result.roomId).toBe('room123');
    expect(result.inviteToken).toBe('abcdefghijklmnop');
  });

  it('parses bare room id', () => {
    expect(parseTableInviteInput('a1b2c3d4e5f67890').roomId).toBe('a1b2c3d4e5f67890');
  });

  it('returns empty for garbage', () => {
    expect(parseTableInviteInput('not-a-room')).toEqual({});
  });
});

describe('createPlayRoomUrl', () => {
  it('returns path only on server', () => {
    expect(createPlayRoomUrl('abc', 'loner', 'inviteinviteinvite')).toBe(
      '/play/abc?system=loner&invite=inviteinviteinvite',
    );
  });
});
