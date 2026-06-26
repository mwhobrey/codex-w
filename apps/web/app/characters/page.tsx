import { CharactersPage } from '@/components/characters/characters-page';
import { SiteHeader } from '@/components/site-header';

export const metadata = {
  title: 'Characters — Codex-W',
  description: 'Create and edit system-neutral character sheets. Stored locally, offline-ready.',
};

export default function CharactersRoute() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="px-6 pt-28 pb-16">
        <CharactersPage />
      </main>
    </>
  );
}
