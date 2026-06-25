import { TyovPlaySurface } from '@/components/solo/tyov-play-surface';
import { SiteHeader } from '@/components/site-header';

export const metadata = {
  title: 'Thousand Year Old Vampire — codex-w',
  description: 'Journaling solo RPG — prompt journal, fading memories, centuries of diary.',
};

export default function TotvSoloPage() {
  return (
    <>
      <SiteHeader />
      <main className="px-6 pt-28 pb-16">
        <TyovPlaySurface />
      </main>
    </>
  );
}
