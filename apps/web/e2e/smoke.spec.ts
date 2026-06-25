import { expect, test } from '@playwright/test';

test.describe('core play loop smoke', () => {
  test('landing → roll → characters → solo loner', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('landing-hero')).toBeVisible();

    await page.goto('/dice');
    await expect(page.getByRole('heading', { name: 'Dice' })).toBeVisible();

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

    await page.goto('/solo/loner');
    await expect(page.getByTestId('solo-loner-surface')).toBeVisible();
    await expect(page.getByText('Solo · Loner')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Oracle play' })).toBeVisible();
  });
});
