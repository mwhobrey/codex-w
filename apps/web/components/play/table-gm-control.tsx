'use client';

import type { TablePeer } from '@/hooks/use-table-awareness';
import { formatPlayerTag } from '@/lib/player-tag';
import { Button, cn } from '@codex/ui';
import { useState } from 'react';

interface TableGmControlProps {
  isGm: boolean;
  gmUserId?: string;
  ownerId: string;
  peers: TablePeer[];
  onTransfer: (toUserId: string) => void;
  className?: string;
}

export function TableGmControl({
  isGm,
  gmUserId,
  ownerId,
  peers,
  onTransfer,
  className,
}: TableGmControlProps) {
  const [open, setOpen] = useState(false);

  const transferTargets = peers.filter(
    (peer) => peer.ownerId && peer.ownerId !== ownerId,
  );

  const gmPeer = peers.find((peer) => peer.ownerId && peer.ownerId === gmUserId);
  const gmLabel = gmPeer
    ? formatPlayerTag(gmPeer.name, gmPeer.characterName)
    : isGm
      ? 'You'
      : 'Another player';

  if (!gmUserId) return null;

  return (
    <div className={cn('relative flex items-center gap-1.5', className)} data-testid="table-gm-control">
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium uppercase tracking-wide',
          isGm
            ? 'border-primary/50 bg-primary/15 text-primary'
            : 'border-border/40 bg-background/40 text-muted-foreground',
        )}
        title={`GM: ${gmLabel}`}
      >
        GM
        {!isGm ? <span className="normal-case tracking-normal">· {gmLabel}</span> : null}
      </span>

      {isGm && transferTargets.length > 0 ? (
        <div className="relative">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs"
            onClick={() => setOpen((value) => !value)}
            data-testid="table-gm-transfer-toggle"
          >
            Pass GM
          </Button>
          {open ? (
            <ul
              className="absolute right-0 top-full z-20 mt-1 min-w-[10rem] rounded-md border border-border/60 bg-card py-1 shadow-lg"
              data-testid="table-gm-transfer-menu"
            >
              {transferTargets.map((peer) => (
                <li key={peer.clientId}>
                  <button
                    type="button"
                    className="block w-full px-3 py-1.5 text-left text-xs text-foreground hover:bg-secondary/60"
                    onClick={() => {
                      if (peer.ownerId) onTransfer(peer.ownerId);
                      setOpen(false);
                    }}
                  >
                    {formatPlayerTag(peer.name, peer.characterName)}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
