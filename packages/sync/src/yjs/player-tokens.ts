import type * as Y from 'yjs';
import { PLAY_ROOM_KEYS, getPlayRoomPlayerTokensMap } from './play-room-doc';

export const PLAYER_TOKEN_RADIUS = 24;

export interface PlayerTokenRecord {
  clientId: number;
  x: number;
  y: number;
  playerName: string;
  characterId: string;
  characterName?: string;
  color: string;
}

export interface PlayerTokenView extends PlayerTokenRecord {
  key: string;
}

export function playerTokenKey(characterId: string): string {
  return characterId;
}

export function defaultPlayerTokenPosition(clientId: number): { x: number; y: number } {
  const slot = Math.abs(clientId) % 8;
  return {
    x: 160 + (slot % 4) * 72,
    y: 160 + Math.floor(slot / 4) * 72,
  };
}

export function readPlayerTokens(doc: Y.Doc): PlayerTokenView[] {
  const map = getPlayRoomPlayerTokensMap(doc);
  const tokens: PlayerTokenView[] = [];
  map.forEach((value, key) => {
    const record = value as PlayerTokenRecord;
    if (!record?.characterId) return;
    tokens.push({ key, ...record });
  });
  return tokens.sort((a, b) => a.key.localeCompare(b.key));
}

export function upsertPlayerToken(
  doc: Y.Doc,
  key: string,
  patch: PlayerTokenRecord,
): PlayerTokenRecord {
  const map = getPlayRoomPlayerTokensMap(doc);
  const existing = map.get(key) as PlayerTokenRecord | undefined;
  const next: PlayerTokenRecord = existing
    ? { ...existing, ...patch, x: existing.x, y: existing.y }
    : patch;

  doc.transact(() => {
    map.set(key, next);
  }, PLAY_ROOM_KEYS.PLAYER_TOKENS);

  return next;
}

export function movePlayerToken(doc: Y.Doc, key: string, x: number, y: number): void {
  const map = getPlayRoomPlayerTokensMap(doc);
  const existing = map.get(key) as PlayerTokenRecord | undefined;
  if (!existing) return;

  doc.transact(() => {
    map.set(key, { ...existing, x, y });
  }, PLAY_ROOM_KEYS.PLAYER_TOKENS);
}

export function removePlayerToken(doc: Y.Doc, key: string): void {
  const map = getPlayRoomPlayerTokensMap(doc);
  doc.transact(() => {
    map.delete(key);
  }, PLAY_ROOM_KEYS.PLAYER_TOKENS);
}

export function prunePlayerTokens(doc: Y.Doc, activeKeys: ReadonlySet<string>): void {
  const map = getPlayRoomPlayerTokensMap(doc);
  doc.transact(() => {
    map.forEach((_value, key) => {
      if (!activeKeys.has(key)) map.delete(key);
    });
  }, PLAY_ROOM_KEYS.PLAYER_TOKENS);
}
