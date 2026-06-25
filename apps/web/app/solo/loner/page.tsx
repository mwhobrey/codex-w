import { LonerPlaySurface } from '@/components/solo/loner-play-surface';
import { SiteHeader } from '@/components/site-header';

export const metadata = {
  title: 'Loner — codex-w',
  description: 'Solo oracle play for Loner. Ask questions, roll risk, trigger twists.',
};

export default function LonerSoloPage() {
  return (
    <>
      <SiteHeader />
      <main className="px-6 pt-28 pb-16">
        <LonerPlaySurface />
      </main>
    </>
  );
}
