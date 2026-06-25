'use client';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@codex/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  readRecentPlayRooms,
  recordRecentPlayRoom,
  removeRecentPlayRoom,
  type RecentPlayRoom,
} from '@/lib/recent-play-rooms';

function createRoomId(): string {
  return crypto.randomUUID().slice(0, 8);
}

export function PlayLobby() {
  const router = useRouter();
  const [joinId, setJoinId] = useState('');
  const [recent, setRecent] = useState<RecentPlayRoom[]>([]);

  useEffect(() => {
    setRecent(readRecentPlayRooms());
  }, []);

  const joinRoom = (id: string) => {
    recordRecentPlayRoom(id);
    router.push(`/play/${encodeURIComponent(id)}`);
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Card className="border-codex-border/60 bg-codex-surface/80 shadow-xl shadow-black/20">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Play together</CardTitle>
          <CardDescription>
            Shared VTT map with offline-first sync. Create a room and send the link — no account
            required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Button
              type="button"
              className="codex-glow w-full"
              onClick={() => joinRoom(createRoomId())}
            >
              Create new room
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
            <Label htmlFor="join-room">Room ID</Label>
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
                onClick={() => joinRoom(joinId)}
              >
                Join
              </Button>
            </div>
          </div>

          <p className="text-center text-xs text-codex-text-muted">
            Maps save on this device. Live sync works when multiplayer relay is running — your room
            still works offline.
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
              {recent.map((room) => (
                <li
                  key={room.id}
                  className="flex items-center gap-2 rounded-lg border border-codex-border/40 bg-codex-void/40 p-2"
                >
                  <button
                    type="button"
                    onClick={() => joinRoom(room.id)}
                    className="min-h-10 flex-1 rounded-md px-3 py-2 text-left hover:bg-codex-elevated/50"
                  >
                    <span className="block font-mono text-sm text-codex-text">{room.id}</span>
                    <span className="block text-xs text-codex-text-muted">
                      {room.label ?? 'Unnamed table'} ·{' '}
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
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <p className="text-center">
        <Link href="/" className="text-sm text-codex-text-muted hover:text-codex-ember">
          ← Back home
        </Link>
      </p>
    </div>
  );
}
