'use client';

import type { TablePeer } from '@/hooks/use-table-awareness';
import { formatPlayerTag } from '@/lib/player-tag';
import { cn } from '@codex/ui';

interface TablePresenceProps {
  peers: TablePeer[];
  localName: string;
  localCharacterName?: string;
  gmUserId?: string;
  usesAccountName?: boolean;
  onLocalNameChange: (name: string) => void;
  className?: string;
}

export function TablePresence({
  peers,
  localName,
  localCharacterName,
  gmUserId,
  usesAccountName = false,
  onLocalNameChange,
  className,
}: TablePresenceProps) {
  const others = peers.filter((peer) => !peer.isSelf);
  const localTag = formatPlayerTag(localName, localCharacterName);

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)} data-testid="table-presence">
      {usesAccountName ? (
        <span
          className="inline-flex h-7 max-w-[14rem] items-center truncate rounded-md border border-border/50 bg-background/40 px-2 text-xs text-foreground"
          title={localTag}
          data-testid="table-presence-account-name"
        >
          {localTag}
        </span>
      ) : (
        <div className="flex max-w-[14rem] items-center gap-0.5">
          <input
            value={localName}
            onChange={(e) => onLocalNameChange(e.target.value)}
            onBlur={(e) => onLocalNameChange(e.target.value)}
            placeholder="Your name"
            className="h-7 min-w-0 flex-1 rounded-md border border-border/50 bg-background/40 px-2 text-xs text-foreground"
            aria-label="Display name at this table"
            data-testid="table-presence-name-input"
          />
          {localCharacterName ? (
            <span
              className="shrink-0 truncate text-[10px] text-muted-foreground"
              title={localTag}
            >
              /{localCharacterName}
            </span>
          ) : null}
        </div>
      )}
      {others.length > 0 ? (
        <ul className="flex flex-wrap items-center gap-1.5">
          {others.map((peer) => {
            const tag = formatPlayerTag(peer.name, peer.characterName);
            const isPeerGm = Boolean(gmUserId && peer.ownerId === gmUserId);
            return (
            <li
              key={peer.clientId}
              data-testid="table-presence-peer"
              className="inline-flex max-w-[14rem] items-center gap-1 truncate rounded-full border border-border/40 bg-background/40 px-2 py-0.5 text-[10px] text-muted-foreground"
              title={isPeerGm ? `GM · ${tag}` : tag}
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: peer.color }}
                aria-hidden
              />
              <span className="truncate">
                {isPeerGm ? <span className="font-medium text-primary">GM · </span> : null}
                {tag}
              </span>
            </li>
            );
          })}
        </ul>
      ) : (
        <span className="text-[10px] text-muted-foreground/60">Solo at table</span>
      )}
    </div>
  );
}
