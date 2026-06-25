'use client';

import type { Awareness } from 'y-protocols/awareness';
import { useCallback, useEffect, useMemo, useState } from 'react';

const DISPLAY_NAME_KEY = 'codex-table-display-name';
const USER_COLORS = ['#f97316', '#38bdf8', '#a78bfa', '#4ade80', '#f472b6', '#facc15'];

export interface TablePeer {
  clientId: number;
  name: string;
  color: string;
  isSelf: boolean;
  cursor?: { x: number; y: number };
  characterName?: string;
}

export interface TableAwarenessState {
  peers: TablePeer[];
  localName: string;
  setLocalName: (name: string) => void;
  setCursor: (cursor: { x: number; y: number } | null) => void;
  setCharacterName: (name: string | undefined) => void;
}

function colorForClient(clientId: number): string {
  return USER_COLORS[Math.abs(clientId) % USER_COLORS.length]!;
}

function readStoredName(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(DISPLAY_NAME_KEY) ?? '';
}

export function useTableAwareness(awareness: Awareness | null): TableAwarenessState {
  const [localName, setLocalNameState] = useState('');
  const [peers, setPeers] = useState<TablePeer[]>([]);

  useEffect(() => {
    setLocalNameState(readStoredName());
  }, []);

  const syncPeers = useCallback(() => {
    if (!awareness) {
      setPeers([]);
      return;
    }
    const next: TablePeer[] = [];
    awareness.getStates().forEach((state, clientId) => {
      const user = state.user as { name?: string; color?: string; characterName?: string } | undefined;
      const cursor = state.cursor as { x: number; y: number } | undefined;
      if (!user?.name) return;
      next.push({
        clientId,
        name: user.name,
        color: user.color ?? colorForClient(clientId),
        isSelf: clientId === awareness.clientID,
        cursor,
        characterName: user.characterName,
      });
    });
    setPeers(next.sort((a, b) => a.clientId - b.clientId));
  }, [awareness]);

  useEffect(() => {
    if (!awareness) return;
    const existing = awareness.getLocalState()?.user as
      | { name?: string; characterName?: string }
      | undefined;
    const name = localName.trim() || existing?.name || `Player ${awareness.clientID}`;
    awareness.setLocalStateField('user', {
      name,
      color: colorForClient(awareness.clientID),
      characterName: existing?.characterName,
    });
    syncPeers();
    awareness.on('change', syncPeers);
    return () => awareness.off('change', syncPeers);
  }, [awareness, localName, syncPeers]);

  const setLocalName = useCallback(
    (name: string) => {
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
    [awareness],
  );

  const setCursor = useCallback(
    (cursor: { x: number; y: number } | null) => {
      if (!awareness) return;
      if (cursor) awareness.setLocalStateField('cursor', cursor);
      else awareness.setLocalStateField('cursor', undefined);
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

  return useMemo(
    () => ({ peers, localName, setLocalName, setCursor, setCharacterName }),
    [localName, peers, setCharacterName, setCursor, setLocalName],
  );
}
