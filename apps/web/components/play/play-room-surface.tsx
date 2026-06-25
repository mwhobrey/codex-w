'use client';

import { usePlayRoom } from '@/hooks/use-play-room';
import Link from 'next/link';
import { ConnectionStatus } from './connection-status';
import { RoomShareBar } from './room-share-bar';
import { SessionLogPanel } from './session-log-panel';
import { VttCanvas } from './vtt-canvas';

interface PlayRoomSurfaceProps {
  roomId: string;
}

export function PlayRoomSurface({ roomId }: PlayRoomSurfaceProps) {
  const { doc, logEntries, connectionStatus, roomUrl, appendLog, ready } = usePlayRoom(roomId);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <header className="flex shrink-0 flex-col gap-3 border-b border-codex-border/50 bg-codex-surface/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-lg font-medium text-codex-text">Play room</h1>
            <ConnectionStatus status={connectionStatus} />
          </div>
          <p className="mt-0.5 truncate font-mono text-xs text-codex-text-muted">{roomId}</p>
        </div>
        <div className="w-full sm:max-w-md">
          <RoomShareBar roomUrl={roomUrl} />
        </div>
      </header>

      {!ready ? (
        <div className="flex flex-1 items-center justify-center text-sm text-codex-text-muted">
          Syncing local map…
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_320px]">
          <div className="relative min-h-[320px] border-b border-codex-border/40 lg:border-b-0 lg:border-r">
            <VttCanvas doc={doc} />
          </div>
          <aside className="min-h-[280px] p-3 lg:max-h-none">
            <SessionLogPanel entries={logEntries} onAppend={appendLog} />
          </aside>
        </div>
      )}

      <footer className="shrink-0 border-t border-codex-border/40 px-4 py-2 text-xs text-codex-text-muted">
        <Link href="/play" className="hover:text-codex-ember">
          ← All play rooms
        </Link>
        <span className="mx-2" aria-hidden>
          ·
        </span>
        <Link href="/dice" className="hover:text-codex-ember">
          Full dice roller
        </Link>
      </footer>
    </div>
  );
}
