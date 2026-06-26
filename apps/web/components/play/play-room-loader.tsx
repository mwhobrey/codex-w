'use client';

import dynamic from 'next/dynamic';

const PlayRoomSurface = dynamic(
  () => import('./play-room-surface').then((mod) => mod.PlayRoomSurface),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-dvh items-center justify-center text-sm text-muted-foreground">
        Loading play room…
      </div>
    ),
  },
);

interface PlayRoomLoaderProps {
  roomId: string;
  initialSystem?: string;
  importSessionId?: string;
  inviteToken?: string;
}

export function PlayRoomLoader({
  roomId,
  initialSystem,
  importSessionId,
  inviteToken,
}: PlayRoomLoaderProps) {
  return (
    <PlayRoomSurface
      roomId={roomId}
      initialSystem={initialSystem}
      importSessionId={importSessionId}
      inviteToken={inviteToken}
    />
  );
}
