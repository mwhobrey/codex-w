import { PlayRoomLoader } from '@/components/play/play-room-loader';
import { SiteHeader } from '@/components/site-header';

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
    <>
      <SiteHeader />
      <main>
        <PlayRoomLoader roomId={roomId} />
      </main>
    </>
  );
}
