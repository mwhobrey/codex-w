import { describe, expect, it } from 'vitest';
import { fromYjsStateBytes, toYjsStateBytes } from './yjs-documents';

describe('yjs document byte helpers', () => {
  it('round-trips Uint8Array through Buffer', () => {
    const original = new Uint8Array([1, 2, 3, 250, 0]);
    const buffer = fromYjsStateBytes(original);
    const restored = toYjsStateBytes(buffer);
    expect(restored).toEqual(original);
  });

  it('parses postgres hex and base64 driver strings', () => {
    const hex = toYjsStateBytes('\\x0102ff');
    expect(Array.from(hex!)).toEqual([1, 2, 255]);

    const b64 = toYjsStateBytes(Buffer.from([9, 8, 7]).toString('base64'));
    expect(Array.from(b64!)).toEqual([9, 8, 7]);
  });

  it('returns null for empty input', () => {
    expect(toYjsStateBytes(null)).toBeNull();
    expect(toYjsStateBytes(undefined)).toBeNull();
  });
});
