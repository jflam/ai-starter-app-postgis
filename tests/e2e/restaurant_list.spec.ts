import { test, expect } from '@playwright/test';

const restaurantCardSelector = '.restaurant-card';
const _mapContainerSelector = '.leaflet-container';

test('restaurant list loads with cards', async ({ page }) => {
  await page.goto('/');
  // Wait for restaurant cards to be visible
  await expect(page.locator(restaurantCardSelector).first()).toBeVisible({ timeout: 10000 });
  // Verify we have multiple restaurant cards
  const restaurantCardsCount = await page.locator(restaurantCardSelector).count();
  expect(restaurantCardsCount).toBeGreaterThan(0);
});

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // Ensure restaurant cards are loaded before each test in this file
  await expect(page.locator(restaurantCardSelector).first()).toBeVisible({ timeout: 10000 });
});

test('clicking a restaurant card centers the map', async ({ page }) => {
  // Cards are already loaded due to beforeEach
  // Removed unused variable 'map'
  const getMapCenter = async () => {
    return await page.evaluate(() => {
      // @ts-expect-error Accessing Leaflet's internal map object
      const mapInstance = (document.querySelector('.leaflet-container') as unknown)?._leaflet_map;
      if (mapInstance) {
        const center = mapInstance.getCenter();
        return { lat: center.lat, lng: center.lng };
      }
      return null;
    });
  };

  const initialCenter = await getMapCenter();
  expect(initialCenter).not.toBeNull();

  const firstRestaurantCard = page.locator('.restaurant-card').first();
  await firstRestaurantCard.click();

  // Wait for map animation
  await page.waitForTimeout(1000); // Adjust if needed

  const newCenter = await getMapCenter();
  expect(newCenter).not.toBeNull();

  // Check that the map center has changed
  expect(newCenter?.lat).not.toEqual(initialCenter?.lat);
  expect(newCenter?.lng).not.toEqual(initialCenter?.lng);

  // TODO: Optionally, verify newCenter is close to the restaurant's actual coordinates
  // This would require getting the restaurant's lat/lng from its data attributes or another source.
  // For example:
  // const restaurantLat = parseFloat(await firstRestaurantCard.getAttribute('data-lat') || '0');
  // const restaurantLng = parseFloat(await firstRestaurantCard.getAttribute('data-lng') || '0');
  // expect(newCenter?.lat).toBeCloseTo(restaurantLat, 1); // Adjust precision as needed
  // expect(newCenter?.lng).toBeCloseTo(restaurantLng, 1);
});

test('restaurant card selection and detail display', async ({ page }) => {
  // Cards are already loaded due to beforeEach

  const firstRestaurantCard = page.locator(restaurantCardSelector).first();
  const restaurantName = await firstRestaurantCard.locator('h3').textContent();

  await firstRestaurantCard.click();

  // Assert that the clicked restaurant card gets a visual indication of being selected
  await expect(firstRestaurantCard).toHaveClass(/selected/, { timeout: 2000 });

  // Assert that a detail panel becomes visible
  const restaurantDetailPanel = page.locator('#restaurant-detail'); // Assuming ID for detail panel
  await expect(restaurantDetailPanel).toBeVisible({ timeout: 2000 });

  // Assert that the detail panel displays information related to the selected restaurant
  // This is a basic check; more specific checks can be added based on actual content
  await expect(restaurantDetailPanel).toContainText(restaurantName || 'details', { timeout: 2000 });
});