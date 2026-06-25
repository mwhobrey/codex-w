import { MuscadinesPlaySurface } from '@/components/solo/muscadines-play-surface';
import { SiteHeader } from '@/components/site-header';

export const metadata = {
  title: 'Midnight Muscadines — codex-w',
  description: 'Cozy-dark folklore solo play with mentor prompts and oracles.',
};

export default function MuscadinesSoloPage() {
  return (
    <>
      <SiteHeader />
      <main className="px-6 pt-28 pb-16">
        <MuscadinesPlaySurface />
      </main>
    </>
  );
}
