import { SoloSystemPicker } from '@/components/solo/solo-system-picker';
import { SiteHeader } from '@/components/site-header';

export const metadata = {
  title: 'Solo — codex-w',
  description: 'Play solo RPGs with built-in oracles. Offline-ready.',
};

export default function SoloPage() {
  return (
    <>
      <SiteHeader />
      <main className="px-6 pt-28 pb-16">
        <SoloSystemPicker />
      </main>
    </>
  );
}
