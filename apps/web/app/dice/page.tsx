import { DiceHub } from '@/components/dice/dice-hub';
import { SiteHeader } from '@/components/site-header';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dice — Codex-W',
  description: 'Roll dice and manage custom formula sets for your table.',
};

export default function DicePage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="px-4 pt-20 pb-16 sm:px-6 sm:pt-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Dice
          </h1>
          <p className="mt-3 text-muted-foreground">
            Roll with tactile feedback. Save formula sets when you want them everywhere.
          </p>
        </div>
        <div className="mt-8">
          <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Loading dice…</p>}>
            <DiceHub />
          </Suspense>
        </div>
      </main>
    </>
  );
}
