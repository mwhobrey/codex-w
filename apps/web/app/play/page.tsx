import { PlayLobby } from '@/components/play/play-lobby';
import { SiteHeader } from '@/components/site-header';

export const metadata = {
  title: 'Play — codex-w',
  description: 'Create or join a shared VTT play room.',
};

export default function PlayIndexPage() {
  return (
    <>
      <SiteHeader />
      <main className="px-6 pt-28 pb-16">
        <PlayLobby />
      </main>
    </>
  );
}
