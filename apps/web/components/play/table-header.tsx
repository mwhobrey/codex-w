'use client';

import type { PlayRoomConnectionStatus } from '@codex/sync';
import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@codex/ui';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import { ConnectionStatus } from './connection-status';

interface TableHeaderProps {
  tableName: string;
  onTableNameChange: (name: string) => void;
  onTableNameSave: () => void;
  roomId: string;
  roomUrl: string;
  systemName?: string;
  connectionStatus: PlayRoomConnectionStatus;
  presence?: ReactNode;
}

export function TableHeader({
  tableName,
  onTableNameChange,
  onTableNameSave,
  roomId,
  roomUrl,
  systemName,
  connectionStatus,
  presence,
}: TableHeaderProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle');

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      setCopiedLink(false);
    }
  }, [roomUrl]);

  const shareInvite = useCallback(async () => {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: tableName.trim() || 'Codex-W table',
          text: 'Join my table on Codex-W',
          url: roomUrl,
        });
        return;
      } catch {
        // User dismissed or share failed — fall back to copy.
      }
    }
    await copyLink();
  }, [copyLink, roomUrl, tableName]);

  const copyId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopiedId(true);
      window.setTimeout(() => setCopiedId(false), 2000);
    } catch {
      setCopiedId(false);
    }
  }, [roomId]);

  const handleNameSave = () => {
    onTableNameSave();
    setSaveState('saved');
    window.setTimeout(() => setSaveState('idle'), 1500);
  };

  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-border/50 bg-card/90 px-3 py-2.5 backdrop-blur-sm sm:px-4">
      <Link
        href="/play"
        className="hidden shrink-0 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-primary sm:inline-flex"
        aria-label="Back to tables"
      >
        ← Tables
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <input
            value={tableName}
            onChange={(e) => onTableNameChange(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
            }}
            placeholder="Untitled table"
            className="min-w-0 flex-1 truncate bg-transparent font-display text-base font-medium text-foreground outline-none placeholder:text-muted-foreground focus:ring-0 sm:text-lg"
            aria-label="Table name"
          />
          {saveState === 'saved' ? (
            <span className="shrink-0 text-xs text-primary">Saved</span>
          ) : null}
        </div>

        <div className="mt-0.5 flex items-center gap-2">
          <ConnectionStatus status={connectionStatus} compact />
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                Table info
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm">
              <SheetHeader>
                <SheetTitle>Table info</SheetTitle>
                <SheetDescription>Room details, sync status, and players.</SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4 text-sm text-muted-foreground">
                {systemName ? (
                  <p>
                    <span className="font-medium text-foreground">System</span>
                    <br />
                    {systemName}
                  </p>
                ) : null}
                <p>
                  <span className="font-medium text-foreground">Table ID</span>
                  <br />
                  <button
                    type="button"
                    onClick={copyId}
                    className="mt-1 inline-flex items-center gap-1 rounded font-mono text-foreground hover:text-primary"
                  >
                    #{roomId}
                    <span className="text-xs uppercase text-muted-foreground/60">
                      {copiedId ? 'copied' : 'copy'}
                    </span>
                  </button>
                </p>
                <div>
                  <span className="font-medium text-foreground">Sync</span>
                  <div className="mt-1">
                    <ConnectionStatus status={connectionStatus} />
                  </div>
                </div>
                {presence ? <div className="space-y-2">{presence}</div> : null}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <Button
        type="button"
        size="sm"
        className="shrink-0"
        onClick={shareInvite}
        title={roomUrl}
        data-testid="copy-invite-link"
      >
        {copiedLink ? 'Copied!' : 'Invite'}
      </Button>
    </header>
  );
}
