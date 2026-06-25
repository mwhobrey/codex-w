import Link from 'next/link';

export const metadata = {
  title: 'Offline — codex-w',
  description: 'You are offline. Cached pages and local data remain available.',
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium tracking-wide text-primary uppercase">Offline</p>
      <h1 className="mt-3 font-display text-4xl font-medium text-foreground">Still at the table</h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        Network is unavailable. Previously visited pages and local character data should still work
        on this device.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
      >
        Return home
      </Link>
    </main>
  );
}
