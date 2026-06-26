'use client';

import type { PlayRoomConnectionStatus } from '@codex/sync';
import { Button, cn } from '@codex/ui';
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
  const [infoOpen, setInfoOpen] = useState(false);

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

  const metadata = (
    <>
      {systemName ? <span>{systemName}</span> : null}
      {systemName ? <span aria-hidden>·</span> : null}
      <button
        type="button"
        onClick={copyId}
        className="inline-flex items-center gap-1 rounded px-1 font-mono transition-colors hover:bg-secondary hover:text-foreground"
        title="Copy table ID"
      >
        #{roomId}
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground/60">
          {copiedId ? 'copied' : 'copy'}
        </span>
      </button>
      <ConnectionStatus status={connectionStatus} compact />
      {presence}
    </>
  );

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
        <input
          value={tableName}
          onChange={(e) => onTableNameChange(e.target.value)}
          onBlur={onTableNameSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
          }}
          placeholder="Untitled table"
          className="w-full truncate bg-transparent font-display text-base font-medium text-foreground outline-none placeholder:text-muted-foreground focus:ring-0 sm:text-lg"
          aria-label="Table name"
        />

        {/* Desktop: inline metadata */}
        <div className="mt-0.5 hidden flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground sm:flex">
          {metadata}
        </div>

        {/* Mobile: collapsible metadata */}
        <div className="mt-1 sm:hidden">
          <button
            type="button"
            onClick={() => setInfoOpen((open) => !open)}
            className="inline-flex items-center gap-1 rounded px-1 py-0.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-expanded={infoOpen}
            aria-controls="table-header-info"
          >
            Table info
            <span aria-hidden className={cn('transition-transform', infoOpen && 'rotate-180')}>
              ▾
            </span>
          </button>
          {infoOpen ? (
            <div
              id="table-header-info"
              className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground"
            >
              {metadata}
            </div>
          ) : null}
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
