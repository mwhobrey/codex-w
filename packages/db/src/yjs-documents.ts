import type { CodexDb } from './client';
import { eq } from 'drizzle-orm';
import { yjsDocuments } from './schema';

/** Normalize driver bytea values to Uint8Array for Hocuspocus. */
export function toYjsStateBytes(value: unknown): Uint8Array | null {
  if (value == null) return null;
  // Buffer is a Uint8Array subclass — copy into a plain Uint8Array.
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(value)) {
    const copy = new Uint8Array(value.byteLength);
    copy.set(value);
    return copy;
  }
  if (value instanceof Uint8Array) {
    const copy = new Uint8Array(value.byteLength);
    copy.set(value);
    return copy;
  }
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (typeof value === 'string') {
    // Postgres / some drivers may return hex (\x…) or base64
    if (value.startsWith('\\x')) {
      return Uint8Array.from(Buffer.from(value.slice(2), 'hex'));
    }
    return Uint8Array.from(Buffer.from(value, 'base64'));
  }
  return null;
}

export function fromYjsStateBytes(state: Uint8Array): Buffer {
  return Buffer.from(state.buffer, state.byteOffset, state.byteLength);
}

export async function fetchYjsDocument(
  db: CodexDb,
  name: string,
): Promise<Uint8Array | null> {
  const rows = await db.select().from(yjsDocuments).where(eq(yjsDocuments.name, name)).limit(1);
  const row = rows[0];
  if (!row) return null;
  return toYjsStateBytes(row.state);
}

export async function storeYjsDocument(
  db: CodexDb,
  name: string,
  state: Uint8Array,
): Promise<void> {
  const now = new Date();
  const buffer = fromYjsStateBytes(state);
  await db
    .insert(yjsDocuments)
    .values({
      name,
      state: buffer,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: yjsDocuments.name,
      set: {
        state: buffer,
        updatedAt: now,
      },
    });
}
