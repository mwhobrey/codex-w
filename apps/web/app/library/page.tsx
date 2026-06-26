import { listLibraryEntries } from '@codex/game-systems';
import { LibraryBrowser } from '@/components/library/library-browser';

export const metadata = {
  title: 'Library — codex-w',
  description: 'Oracle tables, prompts, and story tools across all game systems.',
};

export default function LibraryPage() {
  const entries = listLibraryEntries();
  return (
    <main className="mx-auto min-h-dvh max-w-5xl px-4 py-8 sm:px-6" data-testid="library-page">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-medium text-codex-text">Library</h1>
        <p className="mt-2 max-w-2xl text-sm text-codex-text-muted">
          Browse oracle likelihoods, twist tables, prompt journals, and folklore tables from every
          integrated system — reference without opening a table.
        </p>
      </header>
      <LibraryBrowser entries={entries} />
    </main>
  );
}
