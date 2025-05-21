import { test, expect } from '@playwright/test';

test('homepage loads and shows map', async ({ page }) => {
  await page.goto('/');
  
  // Check for header text
  await expect(page.locator('h1')).toContainText('Restaurant Explorer');
  
  // Check if map container is rendered
  await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 5000 });
  
  // Check if map tiles are loaded
  await expect(page.locator('.leaflet-tile')).toBeVisible();
  
  // Wait for restaurants to load
  await expect(page.locator('.restaurant-card')).toBeVisible({ timeout: 10000 });
  
  // Verify we have multiple restaurant cards
  const restaurantCards = await page.locator('.restaurant-card').count();
  expect(restaurantCards).toBeGreaterThan(0);
});

test('can change search radius', async ({ page }) => {
  await page.goto('/');
  
  // Wait for the range input to be visible
  const rangeInput = page.locator('input[type="range"]');
  await expect(rangeInput).toBeVisible({ timeout: 5000 });
  
  // Get the initial number of restaurants
  await page.waitForSelector('.restaurant-card');
  const _initialCount = await page.locator('.restaurant-card').count();
  
  // Change the search radius
  await rangeInput.fill('15');
  
  // Wait for the change to take effect
  await page.waitForTimeout(1000);
  
  // Check that we still have restaurants
  const newCount = await page.locator('.restaurant-card').count();
  expect(newCount).toBeGreaterThan(0);
  
  // Note: The count might be the same or different depending on the data,
  // so we're just verifying that we still have results
});