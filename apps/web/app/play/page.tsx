import { PlayLobby } from '@/components/play/play-lobby';
import { AppShell } from '@/components/app-shell';
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
      <AppShell width="lobby" testId="play-shell">
        <h1 className="sr-only">Tables</h1>
        <Suspense
          fallback={
            <div className="py-12 text-center text-sm text-muted-foreground">
              Loading tables…
            </div>
          }
        >
          <PlayLobby />
        </Suspense>
      </AppShell>
    </>
  );
}
