import { CharacterEditor } from '@/components/characters/character-editor';
import { AppShell } from '@/components/app-shell';
import { SiteHeader } from '@/components/site-header';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return {
    title: 'Character',
    description: `Edit character sheet ${id}`,
  };
}

export default async function CharacterDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <>
      <SiteHeader />
      <AppShell width="narrow">
        <CharacterEditor sheetId={id} />
      </AppShell>
    </>
  );
}
