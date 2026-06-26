import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Codex-W',
    short_name: 'Codex-W',
    description:
      'Local-first TTRPG toolkit — dice, oracles, character sheets, solo and multiplayer play.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0c0c0f',
    theme_color: '#0c0c0f',
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
