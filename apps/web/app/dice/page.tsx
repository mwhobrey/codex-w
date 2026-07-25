import { DiceHub } from '@/components/dice/dice-hub';
import { AppShell } from '@/components/app-shell';
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
      <AppShell width="default" testId="dice-page">
        <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Loading dice…</p>}>
          <DiceHub />
        </Suspense>
      </AppShell>
    </>
  );
}
