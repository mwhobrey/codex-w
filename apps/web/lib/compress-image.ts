const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.72;

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to decode image'));
    image.src = dataUrl;
  });
}

/**
 * Re-encodes an oversized raster image as a smaller JPEG so it stays reasonable
 * to replicate through the shared Yjs doc. SVGs pass through untouched since
 * canvas re-encoding would rasterize them; results only replace the original
 * if the recompressed version is actually smaller.
 */
export async function compressImageDataUrl(
  dataUrl: string,
  mimeType: string,
): Promise<{ dataUrl: string; mimeType: string }> {
  if (mimeType === 'image/svg+xml') return { dataUrl, mimeType };

  const image = await loadImage(dataUrl);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { dataUrl, mimeType };

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);

  const compressed = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  return compressed.length < dataUrl.length
    ? { dataUrl: compressed, mimeType: 'image/jpeg' }
    : { dataUrl, mimeType };
}
