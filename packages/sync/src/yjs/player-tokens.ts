import type * as Y from 'yjs';
import { PLAY_ROOM_KEYS, getPlayRoomPlayerTokensMap } from './play-room-doc';

export const DEFAULT_PLAYER_TOKEN_RADIUS = 24;
/** @deprecated Use DEFAULT_PLAYER_TOKEN_RADIUS */
export const PLAYER_TOKEN_RADIUS = DEFAULT_PLAYER_TOKEN_RADIUS;
export const MIN_PLAYER_TOKEN_RADIUS = 16;
export const MAX_PLAYER_TOKEN_RADIUS = 72;
export const TOKEN_GRID_SIZE = 24;

export interface PlayerTokenRecord {
  clientId: number;
  x: number;
  y: number;
  radius: number;
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

export function snapTokenPosition(
  x: number,
  y: number,
  gridSize = TOKEN_GRID_SIZE,
): { x: number; y: number } {
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize,
  };
}

export function defaultPlayerTokenPosition(clientId: number): { x: number; y: number } {
  const slot = Math.abs(clientId) % 8;
  const raw = {
    x: 160 + (slot % 4) * 72,
    y: 160 + Math.floor(slot / 4) * 72,
  };
  return snapTokenPosition(raw.x, raw.y);
}

function normalizeRecord(record: PlayerTokenRecord): PlayerTokenRecord {
  const radius = record.radius ?? DEFAULT_PLAYER_TOKEN_RADIUS;
  return {
    ...record,
    radius: Math.min(MAX_PLAYER_TOKEN_RADIUS, Math.max(MIN_PLAYER_TOKEN_RADIUS, radius)),
  };
}

function recordsEqual(a: PlayerTokenRecord, b: PlayerTokenRecord): boolean {
  return (
    a.clientId === b.clientId &&
    a.x === b.x &&
    a.y === b.y &&
    a.radius === b.radius &&
    a.playerName === b.playerName &&
    a.characterId === b.characterId &&
    a.characterName === b.characterName &&
    a.color === b.color
  );
}

export function readPlayerTokens(doc: Y.Doc): PlayerTokenView[] {
  const map = getPlayRoomPlayerTokensMap(doc);
  const tokens: PlayerTokenView[] = [];
  map.forEach((value, key) => {
    const record = value as PlayerTokenRecord;
    if (!record?.characterId) return;
    tokens.push({ key, ...normalizeRecord(record) });
  });
  return tokens.sort((a, b) => a.key.localeCompare(b.key));
}

export function upsertPlayerToken(
  doc: Y.Doc,
  key: string,
  patch: Omit<PlayerTokenRecord, 'radius'> & { radius?: number },
): PlayerTokenRecord {
  const map = getPlayRoomPlayerTokensMap(doc);
  const existing = map.get(key) as PlayerTokenRecord | undefined;
  const next = normalizeRecord(
    existing
      ? {
          ...existing,
          ...patch,
          x: existing.x,
          y: existing.y,
          radius: existing.radius,
        }
      : {
          ...patch,
          radius: patch.radius ?? DEFAULT_PLAYER_TOKEN_RADIUS,
        },
  );

  doc.transact(() => {
    if (!existing || !recordsEqual(existing, next)) {
      map.set(key, next);
    }
  }, PLAY_ROOM_KEYS.PLAYER_TOKENS);

  return next;
}

export function updatePlayerToken(
  doc: Y.Doc,
  key: string,
  patch: Partial<Pick<PlayerTokenRecord, 'x' | 'y' | 'radius' | 'clientId' | 'playerName' | 'characterName' | 'color'>>,
): void {
  const map = getPlayRoomPlayerTokensMap(doc);
  const existing = map.get(key) as PlayerTokenRecord | undefined;
  if (!existing) return;

  const merged = normalizeRecord({ ...existing, ...patch });

  doc.transact(() => {
    if (!recordsEqual(existing, merged)) {
      map.set(key, merged);
    }
  }, PLAY_ROOM_KEYS.PLAYER_TOKENS);
}

/** @deprecated Use updatePlayerToken */
export function movePlayerToken(doc: Y.Doc, key: string, x: number, y: number): void {
  updatePlayerToken(doc, key, { x, y });
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
