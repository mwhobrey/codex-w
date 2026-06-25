import { FeatureGrid } from '@/components/feature-grid';
import { Hero } from '@/components/hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { SoloSpotlight } from '@/components/solo-spotlight';

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <FeatureGrid />
        <SoloSpotlight />
      </main>
      <SiteFooter />
    </>
  );
}
