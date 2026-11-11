import { test, expect } from '@playwright/test';

const homeHeadingText = 'Hello there, Welcome @baseline/web 👋';

test('shows the project heading on the home page', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(homeHeadingText);
});

test('navigates to About and back to Home', async ({ page }) => {
  await page.goto('/');
  const navigation = page.getByRole('navigation');
  const heading = page.getByRole('heading', { level: 1 });

  await navigation.getByRole('link', { name: 'About', exact: true }).click();
  await expect(page).toHaveURL('/about');
  await expect(heading).toHaveText('This is an about page');

  await navigation.getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page).toHaveURL('/');
  await expect(heading).toHaveText(homeHeadingText);
});
