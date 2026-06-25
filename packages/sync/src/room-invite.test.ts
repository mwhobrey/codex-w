import { describe, expect, it } from 'vitest';
import {
  checkRoomInviteAdmission,
  generateInviteToken,
  isValidInviteToken,
  parseInviteFromUri,
} from './room-invite';

describe('room invite helpers', () => {
  it('generates tokens meeting minimum length', () => {
    const token = generateInviteToken();
    expect(isValidInviteToken(token)).toBe(true);
    expect(token.length).toBeGreaterThanOrEqual(16);
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
