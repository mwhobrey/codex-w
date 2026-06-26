'use client';

import { Badge } from '@codex/ui';
import type { PlayRoomConnectionStatus } from '@codex/sync';

const STATUS_LABEL: Record<PlayRoomConnectionStatus, string> = {
  connected: 'Connected',
  connecting: 'Connecting…',
  disconnected: 'Reconnecting…',
  'local-only': 'Offline (start PartyKit for sync)',
  'invite-required': 'Invite code required for live sync',
  'auth-failed': 'Invite rejected — check your link',
};

const STATUS_LABEL_COMPACT: Record<PlayRoomConnectionStatus, string> = {
  connected: 'Live',
  connecting: 'Syncing…',
  disconnected: 'Reconnecting',
  'local-only': 'Offline',
  'invite-required': 'Need invite',
  'auth-failed': 'Invite rejected',
};

const STATUS_VARIANT: Record<PlayRoomConnectionStatus, 'default' | 'secondary' | 'outline'> = {
  connected: 'default',
  connecting: 'secondary',
  disconnected: 'outline',
  'local-only': 'secondary',
  'invite-required': 'outline',
  'auth-failed': 'outline',
};

interface ConnectionStatusProps {
  status: PlayRoomConnectionStatus;
  compact?: boolean;
}

export function ConnectionStatus({ status, compact }: ConnectionStatusProps) {
  const label = compact ? STATUS_LABEL_COMPACT[status] : STATUS_LABEL[status];

  return (
    <Badge
      variant={STATUS_VARIANT[status]}
      className="font-normal"
      data-testid="connection-status"
      data-connection-status={status}
    >
      <span
        className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${
          status === 'connected'
            ? 'bg-success'
            : status === 'local-only' || status === 'invite-required'
              ? 'bg-warning'
              : status === 'auth-failed'
                ? 'bg-destructive'
                : 'bg-primary animate-pulse'
        }`}
        aria-hidden
      />
      {label}
    </Badge>
  );
}
