import { test, expect } from '@playwright/test';

test('shows the project heading on the home page', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Hello there, Welcome @baseline/web 👋',
  );
});
