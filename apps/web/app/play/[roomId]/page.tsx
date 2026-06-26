import { PlayRoomLoader } from '@/components/play/play-room-loader';

export async function generateMetadata({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  return {
    title: `Table ${roomId} — Codex-W`,
    description: 'Shared VTT map, session log, and system tools.',
  };
}

export default async function PlayRoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ system?: string; import?: string; invite?: string }>;
}) {
  const { roomId } = await params;
  const { system, import: importSessionId, invite } = await searchParams;

  return (
    <main className="h-dvh overflow-hidden">
      <PlayRoomLoader
        roomId={roomId}
        initialSystem={system}
        importSessionId={importSessionId}
        inviteToken={invite}
      />
    </main>
  );
}
