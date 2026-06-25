export type Rng = () => number;

/** Returns a float in [0, 1). Uses Web Crypto — available in modern browsers and Node 19+. */
export const defaultRng: Rng = () => {
  const buffer = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buffer);
  return buffer[0]! / 0x1_0000_0000;
};

export function rollInt(min: number, max: number, rng: Rng = defaultRng): number {
  const range = max - min + 1;
  return Math.floor(rng() * range) + min;
}
