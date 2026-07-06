'use client';

import type { RollResult } from '@codex/game-engine';
import type { DicePreset } from '@codex/game-systems';
import type { PlayerNote, PlaySessionLogEntry } from '@codex/schemas';
import { journalRepo, playerNoteRepo, savedTagRepo } from '@codex/sync';
import { Button, Card, CardContent, CardHeader, CardTitle, Textarea, cn } from '@codex/ui';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  LOG_FILTER_OPTIONS,
  LOG_TYPE_LABELS,
  LOG_TYPE_STYLES,
  type LogFilterKey,
  matchesLogFilters,
} from '@/lib/log-entry-labels';
import { queuePlayerNoteSync } from '@/lib/player-note-sync';
import { queueSavedTagSync } from '@/lib/saved-tag-sync';
import { useMemo, useState } from 'react';
import { DiceRollBar } from './dice-roll-bar';

interface SessionLogPanelProps {
  entries: PlaySessionLogEntry[];
  onAppend: (
    entry: Omit<PlaySessionLogEntry, 'id' | 'roomId' | 'createdAt'>,
  ) => PlaySessionLogEntry | null;
  onPatch?: (id: string, patch: Partial<Pick<PlaySessionLogEntry, 'pinned'>>) => void;
  onRoll: (result: RollResult) => void;
  systemDicePresets?: DicePreset[];
  logAuthor?: string;
  ownerId?: string;
  roomId?: string;
}

type FeedItem =
  | { kind: 'shared'; id: string; createdAt: string; entry: PlaySessionLogEntry }
  | { kind: 'private'; id: string; createdAt: string; note: PlayerNote };

function formatRelativeTime(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function parseTags(raw: string): string[] {
  const seen = new Set<string>();
  for (const part of raw.split(',')) {
    const tag = part.trim().slice(0, 32);
    if (tag) seen.add(tag);
    if (seen.size >= 16) break;
  }
  return [...seen];
}

export function SessionLogPanel({
  entries,
  onAppend,
  onPatch,
  onRoll,
  systemDicePresets,
  logAuthor = 'You',
  ownerId,
  roomId,
}: SessionLogPanelProps) {
  const [journal, setJournal] = useState('');
  const [tagsDraft, setTagsDraft] = useState('');
  const [saveTagsForReuse, setSaveTagsForReuse] = useState(false);
  const [privateDraft, setPrivateDraft] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<LogFilterKey>>(new Set());
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const savedTags = useLiveQuery(
    () => (ownerId ? savedTagRepo.listByOwner(ownerId) : Promise.resolve(undefined)),
    [ownerId],
  );

  const privateNotes = useLiveQuery(
    () => (ownerId && roomId ? playerNoteRepo.listByRoom(ownerId, roomId) : Promise.resolve(undefined)),
    [ownerId, roomId],
  );

  const allTags = useMemo(() => {
    const tags = new Set<string>((savedTags ?? []).map((tag) => tag.label));
    for (const entry of entries) {
      for (const tag of entry.tags ?? []) tags.add(tag);
    }
    return [...tags].sort();
  }, [entries, savedTags]);

  const currentTagToken = tagsDraft.split(',').pop()?.trim() ?? '';
  const lastMention = useLiveQuery(async () => {
    if (!ownerId || !roomId || !currentTagToken || !allTags.includes(currentTagToken)) {
      return undefined;
    }
    const match = await journalRepo.findLastMentionInRoom(ownerId, roomId, currentTagToken);
    return match ?? null;
  }, [ownerId, roomId, currentTagToken, allTags]);

  const feed = useMemo(() => {
    const shared: FeedItem[] = entries
      .filter(
        (entry) =>
          matchesLogFilters(entry.type, activeFilters) &&
          (!activeTag || entry.tags?.includes(activeTag)),
      )
      .map((entry) => ({ kind: 'shared' as const, id: entry.id, createdAt: entry.createdAt, entry }));

    // Private notes are yours alone — they always show, independent of the
    // shared log's type/tag filters, since they're not part of that taxonomy.
    const privateItems: FeedItem[] = (privateNotes ?? []).map((note) => ({
      kind: 'private' as const,
      id: note.id,
      createdAt: note.createdAt,
      note,
    }));

    return [...shared, ...privateItems].sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  }, [entries, activeFilters, activeTag, privateNotes]);

  const toggleFilter = (key: LogFilterKey) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const addPrivateNote = () => {
    const trimmed = privateDraft.trim();
    if (!trimmed || !ownerId || !roomId) return;
    const note: PlayerNote = {
      id: crypto.randomUUID(),
      ownerId,
      roomId,
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    void playerNoteRepo.append(note);
    void queuePlayerNoteSync(note);
    setPrivateDraft('');
  };

  const addJournal = () => {
    const trimmed = journal.trim();
    if (!trimmed) return;

    const tags = parseTags(tagsDraft);
    onAppend({
      type: 'journal',
      content: trimmed,
      author: logAuthor,
      tags: tags.length ? tags : undefined,
    });

    if (saveTagsForReuse && ownerId && tags.length) {
      const existingLabels = new Set((savedTags ?? []).map((tag) => tag.label));
      for (const label of tags) {
        if (existingLabels.has(label)) continue;
        const now = new Date().toISOString();
        const saved = {
          id: crypto.randomUUID(),
          ownerId,
          label,
          createdAt: now,
          lastUsedAt: now,
        };
        void savedTagRepo.save(saved);
        void queueSavedTagSync(saved);
      }
    }

    setJournal('');
    setTagsDraft('');
  };

  return (
    <Card className="flex min-h-[280px] flex-col border-border/60 bg-card/80 lg:h-full lg:min-h-0">
      <CardHeader className="shrink-0 space-y-2 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">Session</CardTitle>
          <p className="text-xs text-muted-foreground">
            Roll, log, and note — all in one stream. Private notes are marked and only you can see them.
          </p>
        </div>

        <DiceRollBar onRoll={onRoll} systemPresets={systemDicePresets} roomId={roomId} />

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter log entries">
          <button
            type="button"
            onClick={() => setActiveFilters(new Set())}
            aria-pressed={activeFilters.size === 0}
            className={cn(
              'rounded-full px-2.5 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
              activeFilters.size === 0
                ? 'bg-primary/20 text-primary'
                : 'bg-background/60 text-muted-foreground hover:text-foreground',
            )}
          >
            All
          </button>
          {LOG_FILTER_OPTIONS.map((option) => {
            const active = activeFilters.has(option.key);
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => toggleFilter(option.key)}
                aria-pressed={active}
                className={cn(
                  'rounded-full px-2.5 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active
                    ? 'bg-primary/20 text-primary'
                    : 'bg-background/60 text-muted-foreground hover:text-foreground',
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {allTags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by tag">
            {allTags.map((tag) => {
              const active = activeTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(active ? null : tag)}
                  aria-pressed={active}
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    active
                      ? 'bg-secondary text-secondary-foreground'
                      : 'bg-background/40 text-muted-foreground/80 hover:text-foreground',
                  )}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="flex flex-col gap-3 pt-0 lg:min-h-0 lg:flex-1">
        <div className="max-h-[55vh] overflow-y-auto rounded-lg border border-border/40 bg-background/40 p-2 lg:max-h-none lg:min-h-0 lg:flex-1">
          {feed.length === 0 ? (
            <p className="px-2 py-8 text-center text-xs text-muted-foreground">
              {entries.length === 0
                ? 'Nothing logged yet. Roll dice or ask the oracle — it all lands here.'
                : 'No entries match these filters.'}
            </p>
          ) : (
            <ul className="space-y-2" aria-live="polite">
              {[...feed].reverse().map((item) =>
                item.kind === 'private' ? (
                  <li
                    key={`private-${item.id}`}
                    className="rounded-md border border-dashed border-primary/30 bg-primary/5 px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-primary">
                        🔒 Only you
                      </span>
                      <time className="text-xs text-muted-foreground" dateTime={item.createdAt}>
                        {formatTime(item.createdAt)}
                      </time>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-foreground">{item.note.content}</p>
                  </li>
                ) : (
                  <li
                    key={item.id}
                    className="rounded-md border border-border/30 bg-secondary/40 px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium uppercase tracking-wide',
                          LOG_TYPE_STYLES[item.entry.type],
                        )}
                      >
                        {LOG_TYPE_LABELS[item.entry.type]}
                      </span>
                      <div className="flex items-center gap-2">
                        <time className="text-xs text-muted-foreground" dateTime={item.entry.createdAt}>
                          {formatTime(item.entry.createdAt)}
                        </time>
                        {onPatch ? (
                          <button
                            type="button"
                            aria-label={item.entry.pinned ? 'Unpin entry' : 'Pin entry'}
                            aria-pressed={item.entry.pinned}
                            onClick={() => onPatch(item.entry.id, { pinned: !item.entry.pinned })}
                            className={cn(
                              'rounded text-sm leading-none outline-none focus-visible:ring-2 focus-visible:ring-ring',
                              item.entry.pinned
                                ? 'text-primary'
                                : 'text-muted-foreground/50 hover:text-foreground',
                            )}
                          >
                            ★
                          </button>
                        ) : null}
                      </div>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-foreground">{item.entry.content}</p>
                    {item.entry.type === 'roll' && item.entry.total !== undefined ? (
                      <p className="mt-1 font-display text-2xl font-medium tabular-nums text-primary">
                        {item.entry.total}
                      </p>
                    ) : null}
                    {item.entry.tags?.length ? (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {item.entry.tags.map((tag) => (
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
                ),
              )}
            </ul>
          )}
        </div>

        <div className="shrink-0 border-t border-border/30 pt-3">
          <Textarea
            id="room-journal"
            value={journal}
            onChange={(event) => setJournal(event.target.value)}
            rows={2}
            className="resize-none text-sm"
            placeholder="Add a note to the log…"
            onKeyDown={(event) => {
              if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                addJournal();
              }
            }}
          />

          <div className="mt-2 flex items-center gap-2">
            <input
              type="text"
              value={tagsDraft}
              onChange={(event) => setTagsDraft(event.target.value)}
              list="session-log-saved-tags"
              placeholder="Tags, comma-separated…"
              className="h-8 flex-1 rounded-md border border-border/40 bg-background/60 px-2 text-xs text-foreground placeholder:text-muted-foreground/60"
            />
            <datalist id="session-log-saved-tags">
              {allTags.map((tag) => (
                <option key={tag} value={tag} />
              ))}
            </datalist>
            {ownerId ? (
              <label className="flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground">
                <input
                  type="checkbox"
                  checked={saveTagsForReuse}
                  onChange={(event) => setSaveTagsForReuse(event.target.checked)}
                />
                Save tags
              </label>
            ) : null}
          </div>

          {lastMention ? (
            <p className="mt-1 text-[11px] text-muted-foreground/80">
              Last mentioned{lastMention.chapterNumber ? ` in Chapter ${lastMention.chapterNumber}` : ''} ·{' '}
              {formatRelativeTime(lastMention.entry.createdAt)}
            </p>
          ) : null}

          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground/60">⌘/Ctrl + Enter to post</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addJournal}
              disabled={!journal.trim()}
            >
              Post note
            </Button>
          </div>
        </div>

        {ownerId && roomId ? (
          <div className="shrink-0 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3">
            <p className="text-xs font-medium text-primary">🔒 Private notes</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Only visible to you — never shared with the table.
            </p>
            <Textarea
              id="room-private-note"
              value={privateDraft}
              onChange={(event) => setPrivateDraft(event.target.value)}
              rows={2}
              className="mt-2 resize-none text-sm"
              placeholder="Jot something for yourself…"
              onKeyDown={(event) => {
                if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                  event.preventDefault();
                  addPrivateNote();
                }
              }}
            />
            <div className="mt-2 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPrivateNote}
                disabled={!privateDraft.trim()}
              >
                Save private note
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
