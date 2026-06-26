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
  Input,
  Label,
  Select,
} from '@codex/ui';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { buildPlayRoomPath, parseTableInviteInput } from '@/lib/play-room';
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

export function PlayLobby() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetSystem = parseGameSystemId(searchParams.get('system')) ?? 'generic';
  const systems = listSoloSystems();

  const [pasteLink, setPasteLink] = useState('');
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

  const resolvedInvite = useMemo(
    () => (joinId ? resolvePlayRoomInvite(joinId, joinInvite) : undefined),
    [joinId, joinInvite],
  );

  const canJoin = Boolean(joinId && resolvedInvite);

  const openTable = (
    id: string,
    options?: { gameSystemId?: GameSystemId; importSessionId?: string; inviteToken?: string },
  ) => {
    recordRecentPlayRoom(id, undefined, options?.gameSystemId, options?.inviteToken);
    router.push(buildPlayRoomPath(id, options));
  };

  const importSoloSession = (session: SoloSession) => {
    openTable(createRoomId(), {
      gameSystemId: session.gameSystemId,
      importSessionId: session.id,
      inviteToken: generateInviteToken(),
    });
  };

  const handlePasteLink = (value: string) => {
    setPasteLink(value);
    const parsed = parseTableInviteInput(value);
    if (parsed.roomId) setJoinId(parsed.roomId);
    if (parsed.inviteToken) {
      setJoinInvite(parsed.inviteToken);
    } else if (parsed.roomId) {
      const stored = resolvePlayRoomInvite(parsed.roomId);
      if (stored) setJoinInvite(stored);
    }
  };

  const handleJoinIdChange = (value: string) => {
    setJoinId(value);
    if (value && !joinInvite) {
      const stored = resolvePlayRoomInvite(value);
      if (stored) setJoinInvite(stored);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6" data-testid="play-lobby">
      <header className="sr-only">
        <h1>Tables</h1>
      </header>

      <Card className="border-border/60 bg-card/80 shadow-xl shadow-black/20">
        <CardHeader>
          <h2 className="font-display text-2xl font-medium">Open a table</h2>
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
              <Label htmlFor="join-paste-link">Paste invite link</Label>
              <Input
                id="join-paste-link"
                value={pasteLink}
                onChange={(event) => handlePasteLink(event.target.value)}
                placeholder="https://…/play/abc123?invite=…"
                className="mt-2 font-mono text-sm"
                spellCheck={false}
                data-testid="join-paste-link"
              />
            </div>

            <details className="rounded-lg border border-border/50 bg-background/30 px-3 py-2">
              <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
                Advanced: enter table ID and invite manually
              </summary>
              <div className="mt-3 space-y-3">
                <div>
                  <Label htmlFor="join-room">Table ID</Label>
                  <Input
                    id="join-room"
                    value={joinId}
                    onChange={(event) => handleJoinIdChange(event.target.value.trim())}
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
              </div>
            </details>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={!canJoin}
              data-testid="join-table-button"
              onClick={() => openTable(joinId, { inviteToken: resolvedInvite })}
            >
              Join table
            </Button>
            {joinId && !resolvedInvite ? (
              <p className="text-center text-xs text-muted-foreground">
                Need an invite code — paste the full invite link or open from recent tables.
              </p>
            ) : null}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Invite friends with the share link — you can play alone until they show up.
          </p>
        </CardContent>
      </Card>

      {recent.length > 0 ? (
        <Card className="border-border/60 bg-card/80">
          <CardHeader className="pb-2">
            <h2 className="text-base font-medium">Recent tables</h2>
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
                      <span className="block truncate font-mono text-xs text-muted-foreground/60">
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
