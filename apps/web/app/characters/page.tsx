import { CharactersPage } from '@/components/characters/characters-page';
import { SiteHeader } from '@/components/site-header';

export const metadata = {
  title: 'Characters — codex-w',
  description: 'Create and edit system-neutral character sheets. Stored locally, offline-ready.',
};

export default function CharactersRoute() {
  return (
    <>
      <SiteHeader />
      <main className="px-6 pt-28 pb-16">
        <CharactersPage />
      </main>
    </>
  );
}
