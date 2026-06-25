import { IronforgePlaySurface } from '@/components/solo/ironforge-play-surface';
import { SiteHeader } from '@/components/site-header';

export const metadata = {
  title: 'Ironforge — codex-w',
  description: 'Grim industrial solo survival — swear an oath and beat the forge.',
};

export default function IronforgeSoloPage() {
  return (
    <>
      <SiteHeader />
      <main className="px-6 pt-28 pb-16">
        <IronforgePlaySurface />
      </main>
    </>
  );
}
