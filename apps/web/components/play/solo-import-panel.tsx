'use client';

import { getGameSystem } from '@codex/game-systems';
import { soloSessionRepo } from '@codex/sync';
import type { SoloSession } from '@codex/schemas';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@codex/ui';
import { useLiveQuery } from 'dexie-react-hooks';
import { useOwnerId } from '@/hooks/use-owner-id';

interface SoloImportPanelProps {
  onImport: (session: SoloSession) => void;
}

export function SoloImportPanel({ onImport }: SoloImportPanelProps) {
  const { ownerId, ready } = useOwnerId();
  const sessions = useLiveQuery(
    () => (ready && ownerId ? soloSessionRepo.listByOwner(ownerId) : Promise.resolve(undefined)),
    [ownerId, ready],
  );

  if (!sessions?.length) return null;

  return (
    <Card className="border-codex-border/60 bg-codex-surface/80" data-testid="solo-import-panel">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Import solo archive</CardTitle>
        <CardDescription>
          Bring Dexie solo sessions into a new table — journal entries land in the session log.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {sessions.map((session) => {
            const systemName = getGameSystem(session.gameSystemId).name;
            return (
              <li
                key={session.id}
                className="flex items-center gap-2 rounded-lg border border-codex-border/40 bg-codex-void/40 p-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-codex-text">
                    {session.name ?? 'Untitled session'}
                  </p>
                  <p className="text-xs text-codex-text-muted">
                    {systemName} · {new Date(session.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                  data-testid={`solo-import-${session.id}`}
                  onClick={() => onImport(session)}
                >
                  Import
                </Button>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
