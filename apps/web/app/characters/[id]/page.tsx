import { CharacterEditor } from '@/components/characters/character-editor';
import { SiteHeader } from '@/components/site-header';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return {
    title: `Character — Codex-W`,
    description: `Edit character sheet ${id}`,
  };
}

export default async function CharacterDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="px-6 pt-28 pb-16">
        <CharacterEditor sheetId={id} />
      </main>
    </>
  );
}
