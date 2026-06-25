import { SoloPlaySurface } from '@/components/solo/solo-play-surface';
import { SiteHeader } from '@/components/site-header';

export const metadata = {
  title: 'Generic solo — codex-w',
  description: 'System-neutral oracle play with journal. Works offline.',
};

export default function GenericSoloPage() {
  return (
    <>
      <SiteHeader />
      <main className="px-4 pt-24 pb-16 sm:px-6 sm:pt-28">
        <SoloPlaySurface gameSystemId="generic" playTitle="Generic solo" />
      </main>
    </>
  );
}
