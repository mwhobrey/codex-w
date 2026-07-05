import { JournalPage } from '@/components/journal/journal-page';
import { SiteHeader } from '@/components/site-header';

export const metadata = {
  title: 'Journal',
  description: 'Search journal entries across every chapter and table.',
};

export default function JournalRoute() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="px-6 pt-28 pb-16">
        <JournalPage />
      </main>
    </>
  );
}
