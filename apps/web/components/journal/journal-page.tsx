'use client';

import { getGameSystem } from '@codex/game-systems';
import { journalRepo, playerNoteRepo, playSessionRepo } from '@codex/sync';
import type { GameSystemId, JournalEntry, JournalEntryType, PlaySession } from '@codex/schemas';
import { Card, CardContent, CardHeader, CardTitle, cn } from '@codex/ui';
import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo, useState } from 'react';
import { useOwnerId } from '@/hooks/use-owner-id';

const TYPE_OPTIONS: { key: JournalEntryType; label: string }[] = [
  { key: 'scene', label: 'Scene' },
  { key: 'oracle', label: 'Oracle' },
  { key: 'twist', label: 'Twist' },
  { key: 'risk', label: 'Risk' },
  { key: 'note', label: 'Note' },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function JournalPage() {
  const { ownerId, ready } = useOwnerId();
  const [text, setText] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<JournalEntryType | null>(null);

  const sessions = useLiveQuery(
    () => (ready && ownerId ? playSessionRepo.listByOwner(ownerId) : Promise.resolve(undefined)),
    [ownerId, ready],
  );

  const entries = useLiveQuery(
    () =>
      ready && ownerId
        ? journalRepo.searchByOwner(ownerId, {
            text: text.trim() || undefined,
            tag: activeTag ?? undefined,
            type: activeType ?? undefined,
          })
        : Promise.resolve(undefined),
    [ownerId, ready, text, activeTag, activeType],
  );

  const sessionsById = useMemo(() => {
    const map = new Map<string, PlaySession>();
    for (const session of sessions ?? []) map.set(session.id, session);
    return map;
  }, [sessions]);

  const knownTags = useLiveQuery(
    () => (ready && ownerId ? journalRepo.searchByOwner(ownerId, {}) : Promise.resolve(undefined)),
    [ownerId, ready],
  );

  const tagOptions = useMemo(() => {
    const tags = new Set<string>();
    for (const entry of knownTags ?? []) {
      for (const tag of entry.tags ?? []) tags.add(tag);
    }
    return [...tags].sort();
  }, [knownTags]);

  const grouped = useMemo(() => {
    const groups = new Map<string, JournalEntry[]>();
    for (const entry of entries ?? []) {
      const session = sessionsById.get(entry.sessionId);
      const key = session?.gameSystemId ?? 'unknown';
      const list = groups.get(key) ?? [];
      list.push(entry);
      groups.set(key, list);
    }
    return groups;
  }, [entries, sessionsById]);

  const privateNotes = useLiveQuery(
    () => (ready && ownerId ? playerNoteRepo.listByOwner(ownerId) : Promise.resolve(undefined)),
    [ownerId, ready],
  );

  const roomNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const session of sessions ?? []) {
      if (session.roomId && session.name && !map.has(session.roomId)) {
        map.set(session.roomId, session.name);
      }
    }
    return map;
  }, [sessions]);

  const filteredPrivateNotes = useMemo(() => {
    const query = text.trim().toLowerCase();
    const matches = (privateNotes ?? []).filter(
      (note) => !query || note.content.toLowerCase().includes(query),
    );
    const byRoom = new Map<string, typeof matches>();
    for (const note of matches) {
      const list = byRoom.get(note.roomId) ?? [];
      list.push(note);
      byRoom.set(note.roomId, list);
    }
    return byRoom;
  }, [privateNotes, text]);

  return (
    <div className="mx-auto max-w-3xl" data-testid="journal-page">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Journal
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search every chapter you&apos;ve closed, across every table and system.
          </p>
        </div>

        <Card className="border-border/60 bg-card/80">
          <CardContent className="space-y-3 pt-4">
            <input
              type="text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Search journal content…"
              className="h-9 w-full rounded-md border border-border/40 bg-background/60 px-3 text-sm text-foreground placeholder:text-muted-foreground/60"
            />
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setActiveType(null)}
                className={cn(
                  'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                  activeType === null
                    ? 'bg-primary/20 text-primary'
                    : 'bg-background/60 text-muted-foreground hover:text-foreground',
                )}
              >
                All types
              </button>
              {TYPE_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setActiveType(activeType === option.key ? null : option.key)}
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                    activeType === option.key
                      ? 'bg-primary/20 text-primary'
                      : 'bg-background/60 text-muted-foreground hover:text-foreground',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {tagOptions.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {tagOptions.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                    className={cn(
                      'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                      activeTag === tag
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-background/40 text-muted-foreground/80 hover:text-foreground',
                    )}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        {[...grouped.entries()].map(([systemId, systemEntries]) => (
          <Card key={systemId} className="border-border/60 bg-card/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {systemId === 'unknown'
                  ? 'Unknown system'
                  : getGameSystem(systemId as GameSystemId).name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {systemEntries
                  .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
                  .map((entry) => {
                    const session = sessionsById.get(entry.sessionId);
                    return (
                      <li
                        key={entry.id}
                        className="rounded-md border border-border/30 bg-secondary/40 px-3 py-2"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                          <span>
                            {session?.name ?? 'Untitled'}
                            {session?.chapterNumber ? ` · Chapter ${session.chapterNumber}` : ''}
                          </span>
                          <span>{formatDate(entry.createdAt)}</span>
                        </div>
                        <p className="mt-1 text-sm text-foreground">{entry.content}</p>
                        {entry.tags?.length ? (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {entry.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-background/60 px-2 py-0.5 text-[11px] text-muted-foreground"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
              </ul>
            </CardContent>
          </Card>
        ))}

        {entries && entries.length === 0 && filteredPrivateNotes.size === 0 ? (
          <p className="text-center text-sm text-muted-foreground">No journal entries match.</p>
        ) : null}

        {filteredPrivateNotes.size > 0 ? (
          <div>
            <h2 className="mb-2 text-sm font-medium text-muted-foreground">
              🔒 Your private notes — only visible to you
            </h2>
            <div className="flex flex-col gap-3">
              {[...filteredPrivateNotes.entries()].map(([roomId, notes]) => (
                <Card key={roomId} className="border-dashed border-primary/30 bg-primary/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {roomNameById.get(roomId) ?? `Table ${roomId}`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {notes
                        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
                        .map((note) => (
                          <li
                            key={note.id}
                            className="rounded-md border border-border/30 bg-background/40 px-3 py-2"
                          >
                            <time className="text-xs text-muted-foreground" dateTime={note.createdAt}>
                              {formatDate(note.createdAt)}
                            </time>
                            <p className="mt-1 text-sm text-foreground">{note.content}</p>
                          </li>
                        ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
