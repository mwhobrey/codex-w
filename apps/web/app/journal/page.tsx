import { JournalPage } from '@/components/journal/journal-page';
import { AppShell } from '@/components/app-shell';
import { SiteHeader } from '@/components/site-header';

export const metadata = {
  title: 'Journal',
  description: 'Search journal entries across every chapter and table.',
};

export default function JournalRoute() {
  return (
    <>
      <SiteHeader />
      <AppShell width="narrow" testId="journal-shell">
        <JournalPage />
      </AppShell>
    </>
  );
}
