export type Rng = () => number;

const POOL_SIZE = 512;
const buffer = new Uint32Array(POOL_SIZE);
let poolIndex = POOL_SIZE;

export const defaultRng: Rng = () => {
  if (poolIndex >= POOL_SIZE) {
    globalThis.crypto.getRandomValues(buffer);
    poolIndex = 0;
  }
  const val = buffer[poolIndex];
  poolIndex++;
  return val! / 0x1_0000_0000;
};

export function rollInt(min: number, max: number, rng: Rng = defaultRng): number {
  const range = max - min + 1;
  return Math.floor(rng() * range) + min;
}
