import { expect, test } from '@playwright/test';

// End-to-end: a real browser, the production build of the web app and the
// real API process. Nothing is mocked.
test('home page reports the API as online', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { level: 1, name: 'Testing Lab' }),
  ).toBeVisible();
  await expect(page.getByRole('status')).toHaveText(/^Online · up \d/);
});
