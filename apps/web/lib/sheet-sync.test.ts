import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CharacterSheet } from '@codex/schemas';

const pushOrEnqueue = vi.fn(async () => ({ synced: true }));
const save = vi.fn(async () => undefined);
const isCharacterSheetDeleted = vi.fn(() => false);
const ensureSheetPortraitSynced = vi.fn(async (sheet: CharacterSheet) => sheet);

vi.mock('./push-or-enqueue', () => ({
  pushOrEnqueue: (...args: unknown[]) => pushOrEnqueue(...args),
}));

vi.mock('@codex/sync', () => ({
  characterSheetRepo: {
    save: (...args: unknown[]) => save(...args),
  },
  isCharacterSheetDeleted: (...args: unknown[]) => isCharacterSheetDeleted(...args),
}));

vi.mock('./portrait-cloud-sync', () => ({
  ensureSheetPortraitSynced: (...args: unknown[]) => ensureSheetPortraitSynced(...args),
}));

import { pushSheetDelete, pushSheetSync } from './sheet-sync';

const sampleSheet: CharacterSheet = {
  id: 'sheet-1',
  name: 'Kael',
  gameSystemId: 'loner',
  ownerId: 'local',
  originSystemId: 'loner',
  fields: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('sheet-sync', () => {
  beforeEach(() => {
    pushOrEnqueue.mockClear();
    save.mockClear();
    isCharacterSheetDeleted.mockReset();
    isCharacterSheetDeleted.mockReturnValue(false);
    ensureSheetPortraitSynced.mockClear();
    ensureSheetPortraitSynced.mockImplementation(async (sheet: CharacterSheet) => sheet);
  });

  it('pushSheetSync skips deleted sheets', async () => {
    isCharacterSheetDeleted.mockReturnValue(true);
    const result = await pushSheetSync(sampleSheet);
    expect(result).toEqual({ synced: false });
    expect(pushOrEnqueue).not.toHaveBeenCalled();
  });

  it('pushSheetSync forwards PUT payload with sheet dedupe key', async () => {
    await pushSheetSync(sampleSheet);

    expect(pushOrEnqueue).toHaveBeenCalledOnce();
    const args = pushOrEnqueue.mock.calls[0]?.[0] as {
      dedupeKey: string;
      entity: string;
      method: string;
      url: string;
      body: CharacterSheet;
      request: () => Promise<Response>;
    };
    expect(args.dedupeKey).toBe('sheet:sheet-1');
    expect(args.entity).toBe('sheet');
    expect(args.method).toBe('PUT');
    expect(args.url).toBe('/api/sheets/sheet-1');
    expect(args.body).toEqual(sampleSheet);
    expect(typeof args.request).toBe('function');
  });

  it('pushSheetSync persists portrait URL updates before enqueue path', async () => {
    ensureSheetPortraitSynced.mockResolvedValue({
      ...sampleSheet,
      portraitUrl: 'https://cdn.example/p.png',
    });

    await pushSheetSync(sampleSheet);

    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({ portraitUrl: 'https://cdn.example/p.png' }),
    );
    expect(pushOrEnqueue.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        body: expect.objectContaining({ portraitUrl: 'https://cdn.example/p.png' }),
      }),
    );
  });

  it('pushSheetDelete forwards DELETE with sheet-delete dedupe key', async () => {
    await pushSheetDelete('sheet-1');

    expect(pushOrEnqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        dedupeKey: 'sheet-delete:sheet-1',
        entity: 'sheet-delete',
        method: 'DELETE',
        url: '/api/sheets/sheet-1',
      }),
    );
  });
});
