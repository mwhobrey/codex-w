'use client';

import { journalRepo, playSessionRepo } from '@codex/sync';
import type { PlaySessionLogEntry } from '@codex/schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@codex/ui';
import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';

const GLOSSARY_TAGS = ['npc', 'location', 'item', 'faction'] as const;

interface GlossaryItem {
  id: string;
  content: string;
  tags?: string[];
  createdAt: string;
  chapterLabel?: string;
}

interface TableGlossaryPanelProps {
  entries: PlaySessionLogEntry[];
  ownerId?: string;
  roomId?: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * Derived view grouping tagged entries by a small set of suggested
 * conventions. Pulls both the live table's current log AND every archived
 * chapter for this room (same playSessionRepo + journalRepo combo
 * ChapterListPanel uses) — a glossary should accumulate across the whole
 * campaign, not just whatever's left in the log since the last "End
 * Session" cleared it.
 */
export function TableGlossaryPanel({ entries, ownerId, roomId }: TableGlossaryPanelProps) {
  const chapters = useLiveQuery(
    () => (ownerId && roomId ? playSessionRepo.listByRoom(ownerId, roomId) : Promise.resolve(undefined)),
    [ownerId, roomId],
  );

  const archivedEntries = useLiveQuery(async () => {
    if (!chapters?.length) return [];
    const perChapter = await Promise.all(
      chapters.map(async (session) => {
        const journalEntries = await journalRepo.listBySession(session.id);
        return journalEntries.map(
          (entry): GlossaryItem => ({
            id: entry.id,
            content: entry.content,
            tags: entry.tags,
            createdAt: entry.createdAt,
            chapterLabel: session.chapterNumber ? `Chapter ${session.chapterNumber}` : undefined,
          }),
        );
      }),
    );
    return perChapter.flat();
  }, [chapters]);

  const groups = useMemo(() => {
    const live: GlossaryItem[] = entries.map((entry) => ({
      id: entry.id,
      content: entry.content,
      tags: entry.tags,
      createdAt: entry.createdAt,
    }));
    const all = [...(archivedEntries ?? []), ...live];

    const byTag = new Map<string, GlossaryItem[]>();
    for (const tag of GLOSSARY_TAGS) byTag.set(tag, []);
    for (const item of all) {
      for (const tag of item.tags ?? []) {
        if (!byTag.has(tag)) continue;
        byTag.get(tag)!.push(item);
      }
    }
    for (const list of byTag.values()) {
      list.sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
    }
    return byTag;
  }, [entries, archivedEntries]);

  const hasAny = [...groups.values()].some((list) => list.length > 0);
  if (!hasAny) return null;

  return (
    <Card className="border-border/60 bg-card/80" data-testid="table-glossary-panel">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Glossary</CardTitle>
        <CardDescription>
          Entries tagged #npc, #location, #item, or #faction — first and last mention across the whole
          campaign.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {GLOSSARY_TAGS.map((tag) => {
          const list = groups.get(tag) ?? [];
          if (list.length === 0) return null;
          const first = list[0]!;
          const last = list[list.length - 1]!;
          return (
            <div key={tag}>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                #{tag} · {list.length}
              </p>
              <p className="mt-1 truncate text-sm text-foreground" title={first.content}>
                First: {first.content} · {formatDate(first.createdAt)}
                {first.chapterLabel ? ` · ${first.chapterLabel}` : ''}
              </p>
              {last.id !== first.id ? (
                <p className="mt-0.5 truncate text-sm text-foreground" title={last.content}>
                  Last: {last.content} · {formatDate(last.createdAt)}
                  {last.chapterLabel ? ` · ${last.chapterLabel}` : ''}
                </p>
              ) : null}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
