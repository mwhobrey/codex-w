import { CloudSyncProvider } from '@/components/cloud-sync-provider';
import { DevServiceWorkerCleanup } from '@/components/dev-sw-cleanup';
import type { Metadata, Viewport } from 'next';
import { Fraunces, Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const APP_NAME = 'codex-w';

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
    default: 'codex-w — Your table, anywhere',
    template: '%s — codex-w',
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
  themeColor: '#0a0908',
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
      <body className="codex-grain min-h-full flex flex-col bg-codex-void text-codex-text">
        <DevServiceWorkerCleanup />
        <CloudSyncProvider>{children}</CloudSyncProvider>
      </body>
    </html>
  );
}
