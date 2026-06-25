'use client';

import dynamic from 'next/dynamic';

const PlayRoomSurface = dynamic(
  () => import('./play-room-surface').then((mod) => mod.PlayRoomSurface),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-dvh items-center justify-center text-sm text-codex-text-muted">
        Loading play room…
      </div>
    ),
  },
);

interface PlayRoomLoaderProps {
  roomId: string;
}

export function PlayRoomLoader({ roomId }: PlayRoomLoaderProps) {
  return <PlayRoomSurface roomId={roomId} />;
}
