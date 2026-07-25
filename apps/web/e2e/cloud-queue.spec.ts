import { expect, test } from '@playwright/test';

async function readCloudMutationQueue(page: import('@playwright/test').Page) {
  return page.evaluate(async () => {
    return new Promise<Array<{ dedupeKey?: string; entity?: string }>>((resolve, reject) => {
      const open = indexedDB.open('codex-w');
      open.onerror = () => reject(open.error ?? new Error('indexedDB open failed'));
      open.onsuccess = () => {
        const db = open.result;
        if (![...db.objectStoreNames].includes('cloudMutationQueue')) {
          db.close();
          resolve([]);
          return;
        }
        const tx = db.transaction('cloudMutationQueue', 'readonly');
        const req = tx.objectStore('cloudMutationQueue').getAll();
        req.onerror = () => reject(req.error ?? new Error('getAll failed'));
        req.onsuccess = () => {
          const rows = (req.result ?? []) as Array<{ dedupeKey?: string; entity?: string }>;
          db.close();
          resolve(rows);
        };
      };
    });
  });
}

test.describe('durable cloud mutation queue', () => {
  test('offline character rename enqueues a sheet mutation', async ({ page, context }) => {
    await page.goto('/characters');
    await expect(page.getByTestId('characters-page')).toBeVisible();

    await page.getByTestId('characters-new-generic').click();
    await expect(page).toHaveURL(/\/characters\/[^/]+$/);
    await expect(page.getByTestId('character-name-input')).toBeVisible();

    const sheetId = page.url().split('/characters/')[1]?.split(/[?#]/)[0];
    expect(sheetId).toBeTruthy();

    // Let the initial create push settle (may enqueue while signed out).
    await page.waitForTimeout(300);

    await context.setOffline(true);
    await page.getByTestId('character-name-input').fill(`Offline Hero ${Date.now()}`);

    await expect
      .poll(async () => {
        const rows = await readCloudMutationQueue(page);
        return rows.some(
          (row) => row.entity === 'sheet' && row.dedupeKey === `sheet:${sheetId}`,
        );
      }, { timeout: 10_000 })
      .toBe(true);

    await context.setOffline(false);
  });
});
