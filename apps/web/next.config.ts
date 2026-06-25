import { spawnSync } from 'node:child_process';
import withSerwistInit from '@serwist/next';
import type { NextConfig } from 'next';

const revision =
  spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf-8' }).stdout?.trim() ??
  crypto.randomUUID();

const withSerwist = withSerwistInit({
  additionalPrecacheEntries: [{ url: '/~offline', revision }],
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  // Turbopack dev server conflicts with SW precaching; production build uses webpack.
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  // Serwist injects a webpack plugin; Next 16 defaults to Turbopack for builds.
  turbopack: {},
  transpilePackages: [
    '@codex/db',
    '@codex/schemas',
    '@codex/game-engine',
    '@codex/game-systems',
    '@codex/sync',
    '@codex/ui',
    '@excalidraw/excalidraw',
  ],
};

export default withSerwist(nextConfig);
