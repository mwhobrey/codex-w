import { PlayRoomLoader } from '@/components/play/play-room-loader';

export async function generateMetadata({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  return {
    title: `Room ${roomId} — codex-w`,
    description: 'Shared VTT map and session log.',
  };
}

export default async function PlayRoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;

  return (
    <main className="h-dvh overflow-hidden">
      <PlayRoomLoader roomId={roomId} />
    </main>
  );
}
