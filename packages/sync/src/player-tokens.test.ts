import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PLAYER_TOKEN_RADIUS,
  prunePlayerTokens,
  readPlayerTokens,
  snapTokenPosition,
  updatePlayerToken,
  upsertPlayerToken,
} from './yjs/player-tokens';
import { createPlayRoomDoc } from './yjs/play-room-doc';

const baseRecord = {
  clientId: 1,
  x: 100,
  y: 100,
  playerName: 'Alice',
  characterId: '00000000-0000-4000-8000-000000000001',
  characterName: 'Aria',
  color: '#f97316',
};

describe('player tokens', () => {
  it('snaps positions to the grid', () => {
    expect(snapTokenPosition(13, 37)).toEqual({ x: 24, y: 48 });
  });

  it('upserts and reads tokens', () => {
    const doc = createPlayRoomDoc();
    upsertPlayerToken(doc, baseRecord.characterId, baseRecord);
    const tokens = readPlayerTokens(doc);
    expect(tokens).toHaveLength(1);
    expect(tokens[0]?.playerName).toBe('Alice');
    expect(tokens[0]?.radius).toBe(DEFAULT_PLAYER_TOKEN_RADIUS);
  });

  it('clamps resize radius', () => {
    const doc = createPlayRoomDoc();
    upsertPlayerToken(doc, baseRecord.characterId, baseRecord);
    updatePlayerToken(doc, baseRecord.characterId, { radius: 999 });
    expect(readPlayerTokens(doc)[0]?.radius).toBe(72);
  });

  it('prunes inactive token keys', () => {
    const doc = createPlayRoomDoc();
    upsertPlayerToken(doc, 'char-a', { ...baseRecord, characterId: 'char-a' });
    upsertPlayerToken(doc, 'char-b', { ...baseRecord, characterId: 'char-b' });
    prunePlayerTokens(doc, new Set(['char-a']));
    const keys = readPlayerTokens(doc).map((token) => token.key);
    expect(keys).toEqual(['char-a']);
  });
});
