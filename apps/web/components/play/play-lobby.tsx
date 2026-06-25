'use client';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@codex/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function createRoomId(): string {
  return crypto.randomUUID().slice(0, 8);
}

export function PlayLobby() {
  const router = useRouter();
  const [joinId, setJoinId] = useState('');

  return (
    <div className="mx-auto max-w-lg">
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
              onClick={() => router.push(`/play/${createRoomId()}`)}
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
                onClick={() => router.push(`/play/${encodeURIComponent(joinId)}`)}
              >
                Join
              </Button>
            </div>
          </div>

          <p className="text-center text-xs text-codex-text-muted">
            Maps save on this device. Live sync works when multiplayer relay is running — your
            room still works offline.
          </p>
        </CardContent>
      </Card>

      <p className="mt-8 text-center">
        <Link href="/" className="text-sm text-codex-text-muted hover:text-codex-ember">
          ← Back home
        </Link>
      </p>
    </div>
  );
}
