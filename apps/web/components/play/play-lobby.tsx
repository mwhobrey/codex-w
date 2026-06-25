'use client';

import { getGameSystem, listSoloSystems } from '@codex/game-systems';
import type { GameSystemId } from '@codex/schemas';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
} from '@codex/ui';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  readRecentPlayRooms,
  recordRecentPlayRoom,
  removeRecentPlayRoom,
  type RecentPlayRoom,
} from '@/lib/recent-play-rooms';
import { parseGameSystemId } from '@/lib/table-systems';
import { SoloImportPanel } from './solo-import-panel';
import type { SoloSession } from '@codex/schemas';

function createRoomId(): string {
  return crypto.randomUUID().slice(0, 8);
}

function buildTablePath(id: string, options?: { gameSystemId?: GameSystemId; importSessionId?: string }) {
  const params = new URLSearchParams();
  if (options?.gameSystemId) params.set('system', options.gameSystemId);
  if (options?.importSessionId) params.set('import', options.importSessionId);
  const qs = params.toString();
  return `/play/${encodeURIComponent(id)}${qs ? `?${qs}` : ''}`;
}

export function PlayLobby() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetSystem = parseGameSystemId(searchParams.get('system')) ?? 'generic';
  const systems = listSoloSystems();

  const [joinId, setJoinId] = useState('');
  const [createSystem, setCreateSystem] = useState<GameSystemId>(presetSystem);
  const [recent, setRecent] = useState<RecentPlayRoom[]>([]);

  useEffect(() => {
    setCreateSystem(presetSystem);
  }, [presetSystem]);

  useEffect(() => {
    setRecent(readRecentPlayRooms());
  }, []);

  const openTable = (id: string, options?: { gameSystemId?: GameSystemId; importSessionId?: string }) => {
    recordRecentPlayRoom(id, undefined, options?.gameSystemId);
    router.push(buildTablePath(id, options));
  };

  const importSoloSession = (session: SoloSession) => {
    openTable(createRoomId(), {
      gameSystemId: session.gameSystemId,
      importSessionId: session.id,
    });
  };

  return (
    <div className="mx-auto max-w-lg space-y-6" data-testid="play-lobby">
      <Card className="border-codex-border/60 bg-codex-surface/80 shadow-xl shadow-black/20">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Tables</CardTitle>
          <CardDescription>
            One link for solo or multiplayer — map, log, dice, and system tools stay in sync.
            Works offline; live sync when the relay is running.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="create-system">Game system</Label>
            <Select
              id="create-system"
              className="mt-2"
              value={createSystem}
              onChange={(e) => setCreateSystem(e.target.value as GameSystemId)}
            >
              {systems.map((system) => (
                <option key={system.id} value={system.id}>
                  {system.name}
                </option>
              ))}
            </Select>
            <Button
              type="button"
              className="codex-glow mt-3 w-full"
              data-testid="create-table-button"
              onClick={() => openTable(createRoomId(), { gameSystemId: createSystem })}
            >
              Create new table
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <div className="w-full border-t border-codex-border/50" />
            </div>
            <p className="relative mx-auto w-fit bg-codex-surface px-2 text-xs uppercase tracking-wide text-codex-text-muted">
              or join
            </p>
          </div>

          <div>
            <Label htmlFor="join-room">Table ID</Label>
            <div className="mt-2 flex gap-2">
              <Input
                id="join-room"
                value={joinId}
                onChange={(event) => setJoinId(event.target.value.trim())}
                placeholder="e.g. a1b2c3d4"
                className="font-mono"
                spellCheck={false}
              />
              <Button
                type="button"
                variant="outline"
                disabled={!joinId}
                onClick={() => openTable(joinId)}
              >
                Join
              </Button>
            </div>
          </div>

          <p className="text-center text-xs text-codex-text-muted">
            Invite friends with the share link — you can play alone until they show up.
          </p>
        </CardContent>
      </Card>

      {recent.length > 0 ? (
        <Card className="border-codex-border/60 bg-codex-surface/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent tables</CardTitle>
            <CardDescription>Pick up where you left off — no ID memorization required.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2" data-testid="recent-play-rooms">
              {recent.map((room) => {
                const systemName = room.gameSystemId
                  ? getGameSystem(room.gameSystemId).name
                  : 'Generic';
                return (
                  <li
                    key={room.id}
                    className="flex items-center gap-2 rounded-lg border border-codex-border/40 bg-codex-void/40 p-2"
                  >
                    <button
                      type="button"
                      onClick={() => openTable(room.id, { gameSystemId: room.gameSystemId })}
                      className="min-h-10 flex-1 rounded-md px-3 py-2 text-left hover:bg-codex-elevated/50"
                    >
                      <span className="block font-mono text-sm text-codex-text">{room.id}</span>
                      <span className="block text-xs text-codex-text-muted">
                        {room.label ?? 'Unnamed table'} · {systemName} ·{' '}
                        {new Date(room.visitedAt).toLocaleDateString()}
                      </span>
                    </button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => {
                        removeRecentPlayRoom(room.id);
                        setRecent(readRecentPlayRooms());
                      }}
                    >
                      Remove
                    </Button>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <SoloImportPanel onImport={importSoloSession} />

      <p className="text-center">
        <Link href="/" className="text-sm text-codex-text-muted hover:text-codex-ember">
          ← Back home
        </Link>
      </p>
    </div>
  );
}
