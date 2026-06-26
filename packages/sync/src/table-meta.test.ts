import { describe, expect, it } from 'vitest';
import * as Y from 'yjs';
import {
  claimTableGmIfVacant,
  ensureTableInviteToken,
  readTableMeta,
  seedTableMetaIfEmpty,
  transferTableGm,
} from './yjs/table-meta';
import { createPlayRoomDoc } from './yjs/play-room-doc';

describe('table meta GM + invite', () => {
  it('seeds invite token on empty table', () => {
    const doc = createPlayRoomDoc();
    const meta = seedTableMetaIfEmpty(doc, 'loner', 'Test', undefined, 'invite-token-12345678');
    expect(meta.inviteToken).toBe('invite-token-12345678');
  });

  it('claims vacant GM seat once', () => {
    const doc = createPlayRoomDoc();
    seedTableMetaIfEmpty(doc, 'generic');
    const first = claimTableGmIfVacant(doc, 'user-a');
    const second = claimTableGmIfVacant(doc, 'user-b');
    expect(first.gmUserId).toBe('user-a');
    expect(second.gmUserId).toBe('user-a');
  });

  it('transfers GM between owners', () => {
    const doc = createPlayRoomDoc();
    claimTableGmIfVacant(doc, 'user-a');
    const transferred = transferTableGm(doc, 'user-a', 'user-b');
    expect(transferred?.gmUserId).toBe('user-b');
    expect(readTableMeta(doc).gmUserId).toBe('user-b');
  });

  it('rejects GM transfer from non-GM', () => {
    const doc = createPlayRoomDoc();
    claimTableGmIfVacant(doc, 'user-a');
    expect(transferTableGm(doc, 'user-b', 'user-c')).toBeNull();
  });

  it('ensures invite token only when vacant', () => {
    const doc = createPlayRoomDoc();
    seedTableMetaIfEmpty(doc, 'generic', undefined, undefined, 'original-token-12345');
    const unchanged = ensureTableInviteToken(doc, 'new-token-abcdefghij');
    expect(unchanged.inviteToken).toBe('original-token-12345');

    const doc2 = createPlayRoomDoc();
    seedTableMetaIfEmpty(doc2, 'generic');
    const seeded = ensureTableInviteToken(doc2, 'fresh-token-abcdefghij');
    expect(seeded.inviteToken).toBe('fresh-token-abcdefghij');
  });

  it('does not materialize generic meta before system seed', () => {
    const doc = createPlayRoomDoc();
    ensureTableInviteToken(doc, 'fresh-token-abcdefghij');
    expect(doc.getMap('meta').size).toBe(0);

    const meta = seedTableMetaIfEmpty(doc, 'totv', undefined, undefined, 'fresh-token-abcdefghij');
    expect(meta.gameSystemId).toBe('totv');
    expect(meta.inviteToken).toBe('fresh-token-abcdefghij');
  });
});
