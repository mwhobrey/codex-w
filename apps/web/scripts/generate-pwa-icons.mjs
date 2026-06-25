/**
 * Generates minimal PWA icons (ember W on dark background).
 * Run: node scripts/generate-pwa-icons.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.join(__dirname, '../public/icons');

const background = '#0a0908';
const ember = '#e8a838';

async function createIcon(size) {
  const fontSize = Math.round(size * 0.42);
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" rx="${Math.round(size * 0.18)}" fill="${background}"/>
      <text
        x="50%"
        y="54%"
        dominant-baseline="middle"
        text-anchor="middle"
        font-family="Georgia, serif"
        font-size="${fontSize}"
        font-weight="600"
        fill="${ember}"
      >W</text>
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

await mkdir(iconsDir, { recursive: true });

for (const size of [192, 512]) {
  const buffer = await createIcon(size);
  await writeFile(path.join(iconsDir, `icon-${size}.png`), buffer);
}

console.log('Wrote PWA icons to public/icons/');
