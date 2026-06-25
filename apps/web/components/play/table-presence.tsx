'use client';

import type { TablePeer } from '@/hooks/use-table-awareness';
import { cn } from '@codex/ui';

interface TablePresenceProps {
  peers: TablePeer[];
  localName: string;
  usesAccountName?: boolean;
  onLocalNameChange: (name: string) => void;
  className?: string;
}

export function TablePresence({
  peers,
  localName,
  usesAccountName = false,
  onLocalNameChange,
  className,
}: TablePresenceProps) {
  const others = peers.filter((peer) => !peer.isSelf);

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)} data-testid="table-presence">
      {usesAccountName ? (
        <span
          className="inline-flex h-7 max-w-[10rem] items-center truncate rounded-md border border-codex-border/50 bg-codex-void/40 px-2 text-xs text-codex-text"
          title={localName}
          data-testid="table-presence-account-name"
        >
          {localName}
        </span>
      ) : (
        <input
          value={localName}
          onChange={(e) => onLocalNameChange(e.target.value)}
          onBlur={(e) => onLocalNameChange(e.target.value)}
          placeholder="Your name"
          className="h-7 w-24 rounded-md border border-codex-border/50 bg-codex-void/40 px-2 text-xs text-codex-text"
          aria-label="Display name at this table"
          data-testid="table-presence-name-input"
        />
      )}
      {others.length > 0 ? (
        <ul className="flex flex-wrap items-center gap-1.5">
          {others.map((peer) => (
            <li
              key={peer.clientId}
              className="inline-flex items-center gap-1 rounded-full border border-codex-border/40 bg-codex-void/40 px-2 py-0.5 text-[10px] text-codex-text-muted"
              title={peer.characterName ? `${peer.name} · ${peer.characterName}` : peer.name}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: peer.color }}
                aria-hidden
              />
              {peer.characterName ? `${peer.name} · ${peer.characterName}` : peer.name}
            </li>
          ))}
        </ul>
      ) : (
        <span className="text-[10px] text-codex-text-faint">Solo at table</span>
      )}
    </div>
  );
}
