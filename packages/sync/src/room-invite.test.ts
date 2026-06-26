import { describe, expect, it } from 'vitest';
import {
  checkRoomInviteAdmission,
  generateInviteToken,
  isValidInviteToken,
  parseInviteFromUri,
  resolveTableInviteToken,
  admissionAfterInviteSeed,
} from './room-invite';

describe('room invite helpers', () => {
  it('generates tokens meeting minimum length', () => {
    const token = generateInviteToken();
    expect(isValidInviteToken(token)).toBe(true);
    expect(token.length).toBeGreaterThanOrEqual(16);
  });

  it('resolves invite from url, meta, storage, and recent', () => {
    expect(
      resolveTableInviteToken('url-token-abcdefghij', 'meta-token-abcdefghij', 'stored-token-abc'),
    ).toBe('url-token-abcdefghij');
    expect(resolveTableInviteToken(undefined, 'meta-token-abcdefghij', 'stored-token-abc')).toBe(
      'meta-token-abcdefghij',
    );
    expect(resolveTableInviteToken(undefined, undefined, 'stored-token-abcdefghij')).toBe(
      'stored-token-abcdefghij',
    );
    expect(resolveTableInviteToken(undefined, undefined, undefined, 'recent-token-abcdefgh')).toBe(
      'recent-token-abcdefgh',
    );
  });

  it('rejects loser of concurrent seed race after storage settles', () => {
    expect(admissionAfterInviteSeed('winner-token-abcdefgh', 'loser-token-abcdefgh')).toEqual({
      allowed: false,
      reason: 'invite_invalid',
    });
    expect(admissionAfterInviteSeed('winner-token-abcdefgh', 'winner-token-abcdefgh')).toEqual({
      allowed: true,
      seeded: false,
    });
  });

  it('parses invite from websocket uri', () => {
    const token = 'abc123def456ghi789';
    expect(
      parseInviteFromUri(`ws://127.0.0.1:1999/parties/main/room?invite=${token}`),
    ).toBe(token);
  });

  it('admits first joiner when token is provided', () => {
    expect(checkRoomInviteAdmission(undefined, 'valid-token-123456')).toEqual({
      allowed: true,
      seeded: true,
    });
  });

  it('rejects first joiner without invite', () => {
    expect(checkRoomInviteAdmission(undefined, null)).toEqual({
      allowed: false,
      reason: 'invite_required',
    });
  });

  it('rejects mismatched invite on secured room', () => {
    expect(checkRoomInviteAdmission('secret-token-abcdef', 'wrong-token-abcdef')).toEqual({
      allowed: false,
      reason: 'invite_invalid',
    });
  });

  it('allows matching invite on secured room', () => {
    const token = 'secret-token-abcdef';
    expect(checkRoomInviteAdmission(token, token)).toEqual({
      allowed: true,
      seeded: false,
    });
  });
});
