'use client';

import { journalRepo, soloSessionRepo } from '@codex/sync';
import type { GameSystemId, JournalEntry, SoloSession } from '@codex/schemas';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback, useEffect, useRef } from 'react';
import { useOwnerId } from '@/hooks/use-owner-id';
import { queueJournalSync, queueSessionSync } from '@/lib/session-sync';
import { useCharacter } from './character-picker';
import { createSessionId, defaultSessionName } from './session-picker';

export function useSoloSession(gameSystemId: GameSystemId, sessionIdProp?: string) {
  const { ownerId, ready: ownerReady } = useOwnerId();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initializingRef = useRef(false);
  const lastReplacedSessionRef = useRef<string | null>(null);

  const urlSessionId = searchParams.get('session') ?? undefined;
  const activeSessionId = sessionIdProp ?? urlSessionId;

  const sessions = useLiveQuery(
    () =>
      ownerReady && ownerId
        ? soloSessionRepo.listByOwnerAndSystem(ownerId, gameSystemId)
        : Promise.resolve(undefined),
    [ownerId, ownerReady, gameSystemId],
  );

  const session = useLiveQuery(
    () => (activeSessionId ? soloSessionRepo.get(activeSessionId) : Promise.resolve(undefined)),
    [activeSessionId],
  );

  const activeCharacter = useCharacter(session?.characterId);

  const journalEntries = useLiveQuery(
    () => (session ? journalRepo.listBySession(session.id) : Promise.resolve(undefined)),
    [session?.id],
  );

  const setSessionInUrl = useCallback(
    (id: string) => {
      if (sessionIdProp) return;
      if (lastReplacedSessionRef.current === id && urlSessionId === id) return;
      lastReplacedSessionRef.current = id;
      router.replace(`${pathname}?session=${encodeURIComponent(id)}`, { scroll: false });
    },
    [pathname, router, sessionIdProp, urlSessionId],
  );

  const createDefaultSession = useCallback(async (): Promise<string> => {
    const now = new Date().toISOString();
    const created: SoloSession = {
      id: createSessionId(),
      gameSystemId,
      ownerId,
      name: defaultSessionName(sessions?.length ?? 0),
      createdAt: now,
      updatedAt: now,
    };
    await soloSessionRepo.save(created);
    void queueSessionSync(created);
    return created.id;
  }, [gameSystemId, ownerId, sessions?.length]);

  useEffect(() => {
    if (!ownerReady || sessionIdProp || initializingRef.current) return;
    if (sessions === undefined) return;

    const resolvedId = activeSessionId;

    if (resolvedId) {
      const exists = sessions.some((s) => s.id === resolvedId);
      if (exists) return;
      if (sessions.length > 0) {
        setSessionInUrl(sessions[0]!.id);
        return;
      }
      initializingRef.current = true;
      void createDefaultSession().then((id) => {
        setSessionInUrl(id);
        initializingRef.current = false;
      });
      return;
    }

    if (sessions.length > 0) {
      setSessionInUrl(sessions[0]!.id);
      return;
    }

    initializingRef.current = true;
    void createDefaultSession().then((id) => {
      setSessionInUrl(id);
      initializingRef.current = false;
    });
  }, [activeSessionId, createDefaultSession, ownerReady, sessionIdProp, sessions, setSessionInUrl]);

  const persistSession = useCallback(async (next: SoloSession) => {
    await soloSessionRepo.save(next);
    void queueSessionSync(next);
  }, []);

  const appendJournal = useCallback(
    async (
      type: JournalEntry['type'],
      content: string,
      metadata?: Record<string, unknown>,
      patch?: Partial<SoloSession>,
    ) => {
      if (!session) return;
      const entry: JournalEntry = {
        id: createSessionId(),
        sessionId: session.id,
        type,
        content,
        metadata,
        createdAt: new Date().toISOString(),
      };
      await journalRepo.append(entry);
      const updated = {
        ...session,
        ...patch,
        updatedAt: entry.createdAt,
      };
      await persistSession(updated);
      void queueJournalSync(entry, session.ownerId);
    },
    [persistSession, session],
  );

  const handleCharacterChange = useCallback(
    async (characterId: string | undefined) => {
      if (!session) return;
      const updated: SoloSession = {
        ...session,
        characterId,
        updatedAt: new Date().toISOString(),
      };
      await persistSession(updated);
    },
    [persistSession, session],
  );

  const handleSessionChange = useCallback(
    (id: string) => {
      setSessionInUrl(id);
    },
    [setSessionInUrl],
  );

  const handleExport = useCallback(async () => {
    if (!session) return;
    const md = await journalRepo.exportMarkdown(session.id);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${gameSystemId}-session-${session.id.slice(0, 8)}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [gameSystemId, session]);

  return {
    ownerId,
    ownerReady,
    session,
    sessions,
    activeSessionId,
    activeCharacter,
    journalEntries,
    appendJournal,
    handleCharacterChange,
    handleSessionChange,
    handleExport,
    persistSession,
  };
}
