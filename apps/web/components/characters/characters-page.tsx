'use client';

import {
  genericPlugin,
  ironforgePlugin,
  lonerPlugin,
  muscadinesPlugin,
  snallygasterPlugin,
  totvPlugin,
} from '@codex/game-systems';
import type { GameSystemPlugin } from '@codex/game-systems';
import { characterSheetRepo } from '@codex/sync';
import type { CharacterSheet } from '@codex/schemas';
import { Badge, Button, Card, CardContent } from '@codex/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback, useState } from 'react';
import { useOwnerId } from '@/hooks/use-owner-id';
import { queueSheetSync } from '@/lib/sheet-sync';

const systemPlugins: GameSystemPlugin[] = [
  lonerPlugin,
  totvPlugin,
  snallygasterPlugin,
  muscadinesPlugin,
  ironforgePlugin,
];

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function systemLabel(sheet: CharacterSheet): string {
  if (sheet.gameSystemId === 'loner') return 'Loner';
  if (sheet.gameSystemId === 'totv') return 'TYOV';
  if (sheet.gameSystemId === 'snallygaster') return 'Snallygaster';
  if (sheet.gameSystemId === 'muscadines') return 'Muscadines';
  if (sheet.gameSystemId === 'ironforge') return 'Ironforge';
  if (sheet.gameSystemId === 'generic') return 'Generic';
  return sheet.gameSystemId;
}

export function CharactersPage() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const { ownerId, ready } = useOwnerId();

  const sheets = useLiveQuery(
    () => (ready && ownerId ? characterSheetRepo.listByOwner(ownerId) : Promise.resolve(undefined)),
    [ownerId, ready],
  );

  const handleCreate = useCallback(
    async (plugin: GameSystemPlugin) => {
      setCreating(true);
      try {
        const name = 'Unnamed character';
        const sheet = plugin.createEmptySheet(name, ownerId);
        await characterSheetRepo.save(sheet);
        void queueSheetSync(sheet);
        router.push(`/characters/${sheet.id}`);
      } finally {
        setCreating(false);
      }
    },
    [ownerId, router],
  );

  return (
    <div className="mx-auto max-w-3xl" data-testid="characters-page">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Characters
          </h1>
          <p className="mt-2 text-muted-foreground">
            Stored on this device. Start generic — adapt to a system when your story needs it.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Button
            type="button"
            onClick={() => handleCreate(genericPlugin)}
            disabled={creating}
            className="w-full sm:w-auto"
            data-testid="characters-new-generic"
          >
            {creating ? 'Creating…' : 'New character'}
          </Button>
          <details className="w-full sm:w-auto">
            <summary className="flex cursor-pointer list-none items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-secondary [&::-webkit-details-marker]:hidden">
              System-specific sheet
              <span aria-hidden className="text-muted-foreground/60">▾</span>
            </summary>
            <div className="mt-2 flex flex-wrap gap-2">
              {systemPlugins.map((plugin) => (
                <Button
                  key={plugin.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={creating}
                  onClick={() => handleCreate(plugin)}
                  data-testid={plugin.id === 'loner' ? 'characters-new-loner' : undefined}
                >
                  {plugin.name}
                </Button>
              ))}
            </div>
          </details>
        </div>
      </div>

      {!ready || sheets === undefined ? (
        <Card className="mt-16 border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">Loading characters…</CardContent>
        </Card>
      ) : sheets.length === 0 ? (
        <Card className="mt-16 border-dashed">
          <CardContent className="py-12 text-center">
            <p className="font-display text-xl text-foreground">No characters yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Build a generic sheet first — add only the fields your game needs.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-6"
              onClick={() => handleCreate(genericPlugin)}
              disabled={creating}
            >
              New character
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="mt-10 space-y-3">
          {sheets.map((sheet) => (
            <li key={sheet.id}>
              <Link
                href={`/characters/${sheet.id}`}
                className="group flex items-center justify-between rounded-xl border border-border bg-card px-4 py-4 transition-colors hover:border-primary/30 hover:bg-secondary sm:px-5"
                data-testid="character-sheet-link"
              >
                <div className="min-w-0 pr-3">
                  <p className="truncate font-medium text-foreground group-hover:text-primary">{sheet.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{systemLabel(sheet)}</Badge>
                    {sheet.lineageSheetId && <Badge variant="outline">cross-play</Badge>}
                    <span className="text-xs text-muted-foreground">
                      updated {formatRelativeTime(sheet.updatedAt)}
                    </span>
                  </div>
                </div>
                <span className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
