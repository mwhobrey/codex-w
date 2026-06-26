import { PlayLobby } from '@/components/play/play-lobby';
import { SiteHeader } from '@/components/site-header';
import { Suspense } from 'react';

export const metadata = {
  title: 'Tables',
  description: 'Create or join a table — solo or multiplayer, same link.',
};

export default function PlayIndexPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="px-6 pt-28 pb-16">
        <h1 className="sr-only">Tables</h1>
        <Suspense
          fallback={
            <div className="mx-auto max-w-lg py-12 text-center text-sm text-muted-foreground">
              Loading tables…
            </div>
          }
        >
          <PlayLobby />
        </Suspense>
      </main>
    </>
  );
}
