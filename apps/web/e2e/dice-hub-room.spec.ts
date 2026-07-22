import { expect, test } from '@playwright/test';

test.describe('dice hub room log push', () => {
  test('Manage sets carries invite and rolls land in session log', async ({ page }) => {
    await page.goto('/play?system=loner');
    await page.getByTestId('create-table-button').click();
    await expect(page).toHaveURL(/\/play\/[^/?]+/);
    await expect(page.getByTestId('play-room-surface')).toBeVisible({ timeout: 15_000 });

    await page.getByRole('tab', { name: 'Session' }).click();
    await expect(page.getByTestId('dice-roll-bar')).toBeVisible();

    const manage = page.getByTestId('dice-roll-bar-manage');
    await expect(manage).toHaveAttribute('href', /\/dice\?room=.+&invite=.+/);
    await manage.click();

    await expect(page).toHaveURL(/\/dice\?room=.+&invite=.+/);
    await expect(page.getByTestId('dice-hub')).toBeVisible();
    await expect(page.getByTestId('dice-hub-room-status')).toBeVisible({ timeout: 15_000 });

    await page.getByTestId('dice-roll-button').click();
    await expect(page.getByTestId('dice-roll-result')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Last pushed:/)).toBeVisible({ timeout: 10_000 });

    await page.getByRole('link', { name: 'Back to room' }).click();
    await expect(page.getByTestId('play-room-surface')).toBeVisible({ timeout: 15_000 });

    await page.getByRole('tab', { name: 'Session' }).click();
    await expect(page.getByTestId('session-log-entry').filter({ hasText: /→/ }).first()).toBeVisible({
      timeout: 15_000,
    });
  });
});
