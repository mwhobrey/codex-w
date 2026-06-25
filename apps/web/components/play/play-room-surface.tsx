'use client';

import type { RollResult } from '@codex/game-engine';
import { recordRecentPlayRoom } from '@/lib/recent-play-rooms';
import { usePlayRoom } from '@/hooks/use-play-room';
import { cn } from '@codex/ui';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ConnectionStatus } from './connection-status';
import { PlayDicePanel } from './play-dice-panel';
import { RoomShareBar } from './room-share-bar';
import { SessionLogPanel } from './session-log-panel';
import { VttCanvas } from './vtt-canvas';

interface PlayRoomSurfaceProps {
  roomId: string;
}

type MobilePanel = 'map' | 'dice' | 'log';

export function PlayRoomSurface({ roomId }: PlayRoomSurfaceProps) {
  const { doc, logEntries, connectionStatus, roomUrl, appendLog, ready } = usePlayRoom(roomId);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('map');

  useEffect(() => {
    if (ready) recordRecentPlayRoom(roomId);
  }, [ready, roomId]);

  const handleDiceRoll = useCallback(
    (result: RollResult) => {
      appendLog({
        type: 'roll',
        content: `${result.notation} → ${result.total}`,
        notation: result.notation,
        total: result.total,
        author: 'You',
      });
    },
    [appendLog],
  );

  return (
    <div className="flex h-dvh flex-col bg-codex-void">
      <header className="flex shrink-0 flex-col gap-3 border-b border-codex-border/50 bg-codex-surface/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/play" className="text-xs text-codex-text-muted hover:text-codex-ember">
              ← Play
            </Link>
            <h1 className="font-display text-lg font-medium text-codex-text">Table</h1>
            <ConnectionStatus status={connectionStatus} />
          </div>
          <p className="mt-0.5 truncate font-mono text-xs text-codex-text-muted">{roomId}</p>
        </div>
        <div className="w-full sm:max-w-md">
          <RoomShareBar roomUrl={roomUrl} />
        </div>
      </header>

      <div className="flex shrink-0 gap-1 border-b border-codex-border/40 p-2 lg:hidden">
        {(['map', 'dice', 'log'] as const).map((panel) => (
          <button
            key={panel}
            type="button"
            onClick={() => setMobilePanel(panel)}
            className={cn(
              'min-h-11 flex-1 rounded-md px-3 py-2 text-sm font-medium capitalize transition-colors',
              mobilePanel === panel
                ? 'bg-codex-ember/20 text-codex-ember'
                : 'bg-codex-void/50 text-codex-text-muted',
            )}
          >
            {panel}
          </button>
        ))}
      </div>

      {!ready ? (
        <div className="flex flex-1 items-center justify-center text-sm text-codex-text-muted">
          Syncing local map…
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_340px]">
          <div
            className={cn(
              'relative min-h-0 border-b border-codex-border/40 lg:border-b-0 lg:border-r',
              mobilePanel !== 'map' && 'hidden lg:block',
            )}
          >
            <VttCanvas doc={doc} floatingToolbar />
          </div>

          <aside
            className={cn(
              'flex min-h-0 flex-col gap-3 p-3 lg:border-l lg:border-codex-border/40',
              mobilePanel === 'map' ? 'hidden lg:flex' : 'flex',
            )}
          >
            <div className={cn('shrink-0', mobilePanel === 'log' && 'hidden lg:block')}>
              <PlayDicePanel onRoll={handleDiceRoll} />
            </div>
            <div
              className={cn(
                'min-h-0 flex-1',
                mobilePanel === 'dice' && 'hidden lg:block',
              )}
            >
              <SessionLogPanel entries={logEntries} onAppend={appendLog} />
            </div>
          </aside>
        </div>
      )}

      <footer className="shrink-0 border-t border-codex-border/40 px-4 py-2 text-xs text-codex-text-muted">
        <Link href="/dice" className="hover:text-codex-ember">
          Manage dice sets
        </Link>
      </footer>
    </div>
  );
}
