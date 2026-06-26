import { CloudSyncProvider } from '@/components/cloud-sync-provider';
import { DevServiceWorkerCleanup } from '@/components/dev-sw-cleanup';
import type { Metadata, Viewport } from 'next';
import { Fraunces, Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const APP_NAME = 'Codex-W';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  axes: ['SOFT', 'WONK', 'opsz'],
});

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: 'Codex-W — Your table, anywhere',
    template: '%s — Codex-W',
  },
  description:
    'A local-first TTRPG toolkit. Dice, oracles, character sheets, VTT maps — solo or multiplayer, online or offline.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#0c0c0f',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="codex-grain min-h-full flex flex-col bg-background text-foreground">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none"
        >
          Skip to content
        </a>
        <DevServiceWorkerCleanup />
        <CloudSyncProvider>{children}</CloudSyncProvider>
      </body>
    </html>
  );
}
