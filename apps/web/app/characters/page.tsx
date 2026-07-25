import { CharactersPage } from '@/components/characters/characters-page';
import { AppShell } from '@/components/app-shell';
import { SiteHeader } from '@/components/site-header';

export const metadata = {
  title: 'Characters',
  description: 'Create and edit system-neutral character sheets. Stored locally, offline-ready.',
};

export default function CharactersRoute() {
  return (
    <>
      <SiteHeader />
      <AppShell width="narrow" testId="characters-shell">
        <CharactersPage />
      </AppShell>
    </>
  );
}
