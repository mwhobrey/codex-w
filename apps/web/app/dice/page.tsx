import { DiceHub } from '@/components/dice/dice-hub';
import { SiteHeader } from '@/components/site-header';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dice',
  description: 'Roll dice and manage custom formula sets for your table.',
};

export default function DicePage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="px-4 pt-20 pb-16 sm:px-6 sm:pt-24">
        <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Loading dice…</p>}>
          <DiceHub />
        </Suspense>
      </main>
    </>
  );
}
