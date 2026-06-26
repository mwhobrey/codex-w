'use client';

import { getGameSystem, listSoloSystems } from '@codex/game-systems';
import type { GameSystemId } from '@codex/schemas';
import { generateInviteToken } from '@codex/sync';
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
import { resolvePlayRoomInvite } from '@/lib/resolve-table-invite';
import { SoloImportPanel } from './solo-import-panel';
import type { SoloSession } from '@codex/schemas';

function createRoomId(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 16);
}

function buildTablePath(
  id: string,
  options?: { gameSystemId?: GameSystemId; importSessionId?: string; inviteToken?: string },
) {
  const params = new URLSearchParams();
  if (options?.gameSystemId) params.set('system', options.gameSystemId);
  if (options?.importSessionId) params.set('import', options.importSessionId);
  if (options?.inviteToken) params.set('invite', options.inviteToken);
  const qs = params.toString();
  return `/play/${encodeURIComponent(id)}${qs ? `?${qs}` : ''}`;
}

export function PlayLobby() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetSystem = parseGameSystemId(searchParams.get('system')) ?? 'generic';
  const systems = listSoloSystems();

  const [joinId, setJoinId] = useState('');
  const [joinInvite, setJoinInvite] = useState('');
  const [createSystem, setCreateSystem] = useState<GameSystemId>(presetSystem);
  const [recent, setRecent] = useState<RecentPlayRoom[]>([]);

  useEffect(() => {
    setCreateSystem(presetSystem);
  }, [presetSystem]);

  useEffect(() => {
    setRecent(readRecentPlayRooms());
  }, []);

  const openTable = (
    id: string,
    options?: { gameSystemId?: GameSystemId; importSessionId?: string; inviteToken?: string },
  ) => {
    recordRecentPlayRoom(id, undefined, options?.gameSystemId, options?.inviteToken);
    router.push(buildTablePath(id, options));
  };

  const importSoloSession = (session: SoloSession) => {
    openTable(createRoomId(), {
      gameSystemId: session.gameSystemId,
      importSessionId: session.id,
      inviteToken: generateInviteToken(),
    });
  };

  return (
    <div className="mx-auto max-w-lg space-y-6" data-testid="play-lobby">
      <Card className="border-border/60 bg-card/80 shadow-xl shadow-black/20">
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
              className="mt-3 w-full"
              data-testid="create-table-button"
              onClick={() =>
                openTable(createRoomId(), {
                  gameSystemId: createSystem,
                  inviteToken: generateInviteToken(),
                })
              }
            >
              Create new table
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <div className="w-full border-t border-border/50" />
            </div>
            <p className="relative mx-auto w-fit bg-card px-2 text-xs uppercase tracking-wide text-muted-foreground">
              or join
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="join-room">Table ID</Label>
              <Input
                id="join-room"
                value={joinId}
                onChange={(event) => setJoinId(event.target.value.trim())}
                placeholder="e.g. a1b2c3d4"
                className="mt-2 font-mono"
                spellCheck={false}
              />
            </div>
            <div>
              <Label htmlFor="join-invite">Invite code</Label>
              <Input
                id="join-invite"
                value={joinInvite}
                onChange={(event) => setJoinInvite(event.target.value.trim())}
                placeholder="From the table invite link"
                className="mt-2 font-mono"
                spellCheck={false}
                data-testid="join-invite-input"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={!joinId || !joinInvite}
              data-testid="join-table-button"
              onClick={() => openTable(joinId, { inviteToken: joinInvite })}
            >
              Join table
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Invite friends with the share link — you can play alone until they show up.
          </p>
        </CardContent>
      </Card>

      {recent.length > 0 ? (
        <Card className="border-border/60 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent tables</CardTitle>
            <CardDescription>Pick up where you left off.</CardDescription>
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
                    className="flex items-center gap-2 rounded-lg border border-border/40 bg-background/40 p-2"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        openTable(room.id, {
                          gameSystemId: room.gameSystemId,
                          inviteToken: resolvePlayRoomInvite(room.id, room.inviteToken),
                        })
                      }
                      className="min-h-10 flex-1 rounded-md px-3 py-2 text-left hover:bg-secondary/50"
                    >
                      <span className="block truncate text-sm font-medium text-foreground">
                        {room.label?.trim() || 'Untitled table'}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {systemName} · {new Date(room.visitedAt).toLocaleDateString()}
                      </span>
                      <span className="block truncate font-mono text-[10px] text-muted-foreground/60">
                        #{room.id}
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
        <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
          ← Back home
        </Link>
      </p>
    </div>
  );
}
