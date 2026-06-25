import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'codex-w',
    short_name: 'codex-w',
    description:
      'Local-first TTRPG toolkit — dice, oracles, character sheets, solo and multiplayer play.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0908',
    theme_color: '#0a0908',
    orientation: 'any',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
