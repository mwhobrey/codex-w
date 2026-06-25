import { SnallygasterPlaySurface } from '@/components/solo/snallygaster-play-surface';
import { SiteHeader } from '@/components/site-header';

export const metadata = {
  title: 'Camp Snallygaster — codex-w',
  description: 'Summer camp horror solo play with Lasers & Feelings.',
};

export default function SnallygasterSoloPage() {
  return (
    <>
      <SiteHeader />
      <main className="px-6 pt-28 pb-16">
        <SnallygasterPlaySurface />
      </main>
    </>
  );
}
