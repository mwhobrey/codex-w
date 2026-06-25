import { expect, test } from '@playwright/test';

test.describe('core play loop smoke', () => {
  test('landing → roll → characters → loner table', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('landing-hero')).toBeVisible();

    await page.goto('/dice');
    await expect(page.getByRole('heading', { name: 'Dice', exact: true })).toBeVisible();

    const rollButton = page.getByTestId('dice-roll-button');
    await rollButton.click();
    await expect(rollButton).toHaveText('Rolling…');
    await expect(page.getByTestId('dice-roll-result')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('dice-roll-total')).toContainText(/\d+/);

    await page.goto('/characters');
    await expect(page.getByTestId('characters-page')).toBeVisible();

    const characterLinks = page.getByTestId('character-sheet-link');
    if ((await characterLinks.count()) === 0) {
      await page.getByTestId('characters-new-generic').click();
      await expect(page).toHaveURL(/\/characters\/[^/]+$/);
      await page.goto('/characters');
      await expect(characterLinks.first()).toBeVisible();
    } else {
      await expect(characterLinks.first()).toBeVisible();
    }

    await page.goto('/play?system=loner');
    await expect(page.getByTestId('play-lobby')).toBeVisible();
    await expect(page.getByLabel('Game system')).toHaveValue('loner');
    await page.getByTestId('create-table-button').click();
    await expect(page).toHaveURL(/\/play\/[^/?]+(\?.*invite=.+)?$/);
    await expect(page.getByTestId('play-room-surface')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('table-system-panel')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('table-presence')).toBeVisible();
    await expect(page.getByTestId('character-peek-button')).toBeVisible();
    await expect(page.getByText('Loner', { exact: true }).first()).toBeVisible();
    await expect(page.getByTestId('floating-dice-toggle')).toBeVisible();
    await page.getByTestId('floating-dice-toggle').click();
    await expect(page.getByTestId('floating-dice-roll')).toBeVisible();
  });

  test('TYOV table loads embedded journal panel', async ({ page }) => {
    await page.goto('/play?system=totv');
    await expect(page.getByTestId('play-lobby')).toBeVisible();
    await page.getByTestId('create-table-button').click();
    await expect(page).toHaveURL(/\/play\/[^/?]+(\?.*)?$/);
    await expect(page.getByTestId('play-room-surface')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('table-totv-panel')).toBeVisible({ timeout: 15_000 });
  });
});
