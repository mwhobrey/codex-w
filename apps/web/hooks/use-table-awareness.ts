'use client';

import type { MapViewRole } from '@/lib/table-systems';
import type { Awareness } from 'y-protocols/awareness';
import { useCallback, useEffect, useMemo, useState } from 'react';

const DISPLAY_NAME_KEY = 'codex-table-display-name';
const USER_COLORS = ['#f97316', '#38bdf8', '#a78bfa', '#4ade80', '#f472b6', '#facc15'];

type AwarenessUser = {
  name?: string;
  color?: string;
  characterId?: string;
  characterName?: string;
  mapRole?: MapViewRole;
  accountId?: string;
};

export interface UseTableAwarenessOptions {
  /** When signed in, broadcast account name instead of a manual table nickname. */
  accountDisplayName?: string;
  accountId?: string;
}

export interface TablePeer {
  clientId: number;
  name: string;
  color: string;
  isSelf: boolean;
  cursor?: { x: number; y: number };
  characterId?: string;
  characterName?: string;
  mapRole?: MapViewRole;
}

export interface TableAwarenessState {
  peers: TablePeer[];
  clientId: number | null;
  localName: string;
  localCharacterId: string | undefined;
  localMapRole: MapViewRole;
  usesAccountName: boolean;
  setLocalName: (name: string) => void;
  setCursor: (cursor: { x: number; y: number } | null) => void;
  setCharacterId: (characterId: string | undefined) => void;
  setCharacterName: (name: string | undefined) => void;
  setMapRole: (role: MapViewRole) => void;
}

function colorForClient(clientId: number): string {
  return USER_COLORS[Math.abs(clientId) % USER_COLORS.length]!;
}

function readStoredName(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(DISPLAY_NAME_KEY) ?? '';
}

function readMapRole(user: AwarenessUser | undefined): MapViewRole {
  return user?.mapRole === 'player' ? 'player' : 'gm';
}

function resolvePresenceName(
  awareness: Awareness,
  options: {
    accountDisplayName?: string;
    localName: string;
    existingName?: string;
  },
): string {
  const account = options.accountDisplayName?.trim();
  if (account) return account;
  const manual = options.localName.trim();
  if (manual) return manual;
  if (options.existingName?.trim()) return options.existingName.trim();
  return `Player ${awareness.clientID}`;
}

export function useTableAwareness(
  awareness: Awareness | null,
  options: UseTableAwarenessOptions = {},
): TableAwarenessState {
  const { accountDisplayName, accountId } = options;
  const usesAccountName = Boolean(accountDisplayName?.trim());
  const [localName, setLocalNameState] = useState('');
  const [localCharacterId, setLocalCharacterId] = useState<string | undefined>();
  const [localMapRole, setLocalMapRole] = useState<MapViewRole>('gm');
  const [peers, setPeers] = useState<TablePeer[]>([]);

  useEffect(() => {
    if (usesAccountName) {
      setLocalNameState(accountDisplayName!.trim());
      return;
    }
    setLocalNameState(readStoredName());
  }, [accountDisplayName, usesAccountName]);

  const syncPeers = useCallback(() => {
    if (!awareness) {
      setPeers([]);
      return;
    }
    const next: TablePeer[] = [];
    awareness.getStates().forEach((state, clientId) => {
      const user = state.user as AwarenessUser | undefined;
      const cursor = state.cursor as { x: number; y: number } | undefined;
      if (!user?.name) return;
      next.push({
        clientId,
        name: user.name,
        color: user.color ?? colorForClient(clientId),
        isSelf: clientId === awareness.clientID,
        cursor,
        characterId: user.characterId,
        characterName: user.characterName,
        mapRole: readMapRole(user),
      });
    });
    setPeers(next.sort((a, b) => a.clientId - b.clientId));
    const localUser = awareness.getLocalState()?.user as AwarenessUser | undefined;
    setLocalCharacterId(localUser?.characterId);
    setLocalMapRole(readMapRole(localUser));
  }, [awareness]);

  useEffect(() => {
    if (!awareness) return;
    const existing = awareness.getLocalState()?.user as AwarenessUser | undefined;
    const name = resolvePresenceName(awareness, {
      accountDisplayName,
      localName,
      existingName: existing?.name,
    });
    awareness.setLocalStateField('user', {
      name,
      color: colorForClient(awareness.clientID),
      characterId: existing?.characterId,
      characterName: existing?.characterName,
      mapRole: existing?.mapRole ?? 'gm',
      accountId: accountId ?? existing?.accountId,
    });
    syncPeers();
    awareness.on('change', syncPeers);
    return () => awareness.off('change', syncPeers);
  }, [accountDisplayName, accountId, awareness, localName, syncPeers]);

  const setLocalName = useCallback(
    (name: string) => {
      if (usesAccountName) return;
      const trimmed = name.trim();
      setLocalNameState(trimmed);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(DISPLAY_NAME_KEY, trimmed);
      }
      if (!awareness) return;
      const user = awareness.getLocalState()?.user as Record<string, unknown> | undefined;
      awareness.setLocalStateField('user', {
        ...user,
        name: trimmed || `Player ${awareness.clientID}`,
        color: colorForClient(awareness.clientID),
      });
    },
    [awareness, usesAccountName],
  );

  const setCursor = useCallback(
    (cursor: { x: number; y: number } | null) => {
      if (!awareness) return;
      if (cursor) awareness.setLocalStateField('cursor', cursor);
      else awareness.setLocalStateField('cursor', undefined);
    },
    [awareness],
  );

  const setCharacterId = useCallback(
    (characterId: string | undefined) => {
      setLocalCharacterId(characterId);
      if (!awareness) return;
      const user = awareness.getLocalState()?.user as Record<string, unknown> | undefined;
      awareness.setLocalStateField('user', {
        ...user,
        characterId,
        characterName: undefined,
      });
    },
    [awareness],
  );

  const setCharacterName = useCallback(
    (characterName: string | undefined) => {
      if (!awareness) return;
      const user = awareness.getLocalState()?.user as Record<string, unknown> | undefined;
      awareness.setLocalStateField('user', { ...user, characterName });
    },
    [awareness],
  );

  const setMapRole = useCallback(
    (mapRole: MapViewRole) => {
      setLocalMapRole(mapRole);
      if (!awareness) return;
      const user = awareness.getLocalState()?.user as Record<string, unknown> | undefined;
      awareness.setLocalStateField('user', { ...user, mapRole });
    },
    [awareness],
  );

  return useMemo(
    () => ({
      peers,
      clientId: awareness?.clientID ?? null,
      localName,
      localCharacterId,
      localMapRole,
      usesAccountName,
      setLocalName,
      setCursor,
      setCharacterId,
      setCharacterName,
      setMapRole,
    }),
    [
      awareness,
      localCharacterId,
      localMapRole,
      localName,
      peers,
      setCharacterId,
      setCharacterName,
      setCursor,
      setLocalName,
      setMapRole,
      usesAccountName,
    ],
  );
}
