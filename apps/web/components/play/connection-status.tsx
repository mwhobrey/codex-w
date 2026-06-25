'use client';

import { Badge } from '@codex/ui';
import type { PlayRoomConnectionStatus } from '@codex/sync';

const STATUS_LABEL: Record<PlayRoomConnectionStatus, string> = {
  connected: 'Connected',
  connecting: 'Connecting…',
  disconnected: 'Reconnecting…',
  'local-only': 'Offline (start PartyKit for sync)',
};

const STATUS_VARIANT: Record<PlayRoomConnectionStatus, 'default' | 'secondary' | 'outline'> = {
  connected: 'default',
  connecting: 'secondary',
  disconnected: 'outline',
  'local-only': 'secondary',
};

interface ConnectionStatusProps {
  status: PlayRoomConnectionStatus;
}

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  return (
    <Badge variant={STATUS_VARIANT[status]} className="font-normal">
      <span
        className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${
          status === 'connected'
            ? 'bg-emerald-400'
            : status === 'local-only'
              ? 'bg-amber-400'
              : 'bg-codex-ember animate-pulse'
        }`}
        aria-hidden
      />
      {STATUS_LABEL[status]}
    </Badge>
  );
}
