'use client';

import type { PlaySessionLogEntry } from '@codex/schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@codex/ui';
import { useMemo } from 'react';

const GLOSSARY_TAGS = ['npc', 'location', 'item', 'faction'] as const;

interface TableGlossaryPanelProps {
  entries: PlaySessionLogEntry[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** Pure derived view — groups tagged entries by a small set of suggested (not enforced) conventions. */
export function TableGlossaryPanel({ entries }: TableGlossaryPanelProps) {
  const groups = useMemo(() => {
    const byTag = new Map<string, PlaySessionLogEntry[]>();
    for (const tag of GLOSSARY_TAGS) byTag.set(tag, []);
    for (const entry of entries) {
      for (const tag of entry.tags ?? []) {
        if (!byTag.has(tag)) continue;
        byTag.get(tag)!.push(entry);
      }
    }
    for (const list of byTag.values()) {
      list.sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
    }
    return byTag;
  }, [entries]);

  const hasAny = [...groups.values()].some((list) => list.length > 0);
  if (!hasAny) return null;

  return (
    <Card className="border-border/60 bg-card/80" data-testid="table-glossary-panel">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Glossary</CardTitle>
        <CardDescription>
          Entries tagged #npc, #location, #item, or #faction — first and last mention.
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
              </p>
              {last.id !== first.id ? (
                <p className="mt-0.5 truncate text-sm text-foreground" title={last.content}>
                  Last: {last.content} · {formatDate(last.createdAt)}
                </p>
              ) : null}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
