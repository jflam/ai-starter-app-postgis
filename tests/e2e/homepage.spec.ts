import { test, expect } from '@playwright/test';

test('homepage has title and header', async ({ page }) => {
  await page.goto('/');
  
  // Check page title
  await expect(page).toHaveTitle(/Restaurant Explorer/);
  
  // Check for header content
  const header = page.locator('h1');
  await expect(header).toContainText('Restaurant Explorer');
});