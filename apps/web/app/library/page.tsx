import { listLibraryEntries } from '@codex/game-systems';
import { LibraryPageClient } from '@/components/library/library-page-client';
import { SiteHeader } from '@/components/site-header';

export const metadata = {
  title: 'Library',
  description: 'Oracle tables, prompts, and story tools across all game systems.',
};

export default function LibraryPage() {
  const referenceEntries = listLibraryEntries();
  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        className="mx-auto min-h-dvh max-w-5xl px-4 pt-20 pb-16 sm:px-6 sm:pt-24"
        data-testid="library-page"
      >
        <header className="mb-8">
          <h1 className="font-display text-3xl font-medium text-foreground">Library</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Reference tables show bundled mechanics. Save a copy to My tables and fill in text from your
            own books — yours sync locally and when you sign in.
          </p>
        </header>
        <LibraryPageClient referenceEntries={referenceEntries} />
      </main>
    </>
  );
}
