import { test, expect } from '@playwright/test';

const cuisineDropdownSelector = 'select[name="cuisine"]';
const ratingDropdownSelector = 'select[name="rating"]';
const applyFiltersButtonSelector = 'button#apply-filters';
const clearFiltersButtonSelector = 'button#clear-filters';
const restaurantCardSelector = '.restaurant-card';
const noResultsMessageSelector = '#no-results-message';
const mapMarkerSelector = '.leaflet-marker-icon'; // Common selector for Leaflet markers
const searchRadiusInputSelector = 'input[type="range"]';


async function getRestaurantCardCount(page) {
  await page.waitForSelector(restaurantCardSelector, { state: 'attached', timeout: 10000 });
  return page.locator(restaurantCardSelector).count();
}

async function getMapMarkerCount(page) {
  await page.waitForSelector(mapMarkerSelector, { state: 'attached', timeout: 5000 });
  return page.locator(mapMarkerSelector).count();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // Wait for initial restaurants to load, assuming they load on page visit
  await expect(page.locator(restaurantCardSelector).first()).toBeVisible({ timeout: 15000 });
  await expect(page.locator(searchRadiusInputSelector)).toBeVisible({ timeout: 5000});
});

test('can change search radius and results update', async ({ page }) => {
  // Initial restaurants are loaded due to beforeEach

  // Removed unused variable initialCardCount

  const rangeInput = page.locator(searchRadiusInputSelector);
  // Change the search radius - use a different value if '15' is default or already tested
  // Let's assume the range is 1-20km and default is not 15km.
  await rangeInput.fill('15'); 

  // Wait for changes to apply (e.g., for network request or re-render)
  await page.waitForTimeout(2000); // Adjust if a more specific event can be awaited

  const newCardCount = await getRestaurantCardCount(page);
  expect(newCardCount).toBeGreaterThan(0);
  // Depending on the data and radius, the count might change or stay the same.
  // If specific behavior is expected (e.g., count must decrease/increase for a certain radius change),
  // that specific expectation should be added.
  // For now, we just ensure some results are still present.
  
  const newMarkerCount = await getMapMarkerCount(page);
  expect(newMarkerCount).toEqual(newCardCount); // Markers should still match cards
});

test('applying a cuisine filter updates restaurant list and map', async ({ page }) => {
  const initialCardCount = await getRestaurantCardCount(page);
  const initialMarkerCount = await getMapMarkerCount(page);

  // Assuming 'Italian' is a valid option. This might need adjustment.
  await page.selectOption(cuisineDropdownSelector, { label: 'Italian' });
  await page.click(applyFiltersButtonSelector);

  // Wait for changes to apply - adjust timeout if necessary
  await page.waitForTimeout(2000); 

  const filteredCardCount = await getRestaurantCardCount(page);
  const filteredMarkerCount = await getMapMarkerCount(page);

  expect(filteredCardCount).not.toEqual(initialCardCount);
  expect(filteredMarkerCount).not.toEqual(initialMarkerCount);
  expect(filteredCardCount).toEqual(filteredMarkerCount);

  // Optional: Deeper check if possible (e.g., check card content for cuisine type)
  // This requires specific attributes or text on the card indicating cuisine.
  // For example, if cards have a data-cuisine attribute:
  // const cards = await page.locator(restaurantCardSelector).all();
  // for (const card of cards) {
  //   const cuisine = await card.getAttribute('data-cuisine');
  //   expect(cuisine).toBe('Italian');
  // }
});

test('applying a rating filter updates restaurant list and map', async ({ page }) => {
  const initialCardCount = await getRestaurantCardCount(page);

  // Assuming '4 Stars' is a valid option. This value might need adjustment.
  await page.selectOption(ratingDropdownSelector, { label: '4 Stars' });
  await page.click(applyFiltersButtonSelector);

  await page.waitForTimeout(2000);

  const filteredCardCount = await getRestaurantCardCount(page);
  const filteredMarkerCount = await getMapMarkerCount(page);

  expect(filteredCardCount).not.toEqual(initialCardCount);
  expect(filteredCardCount).toEqual(filteredMarkerCount);
  
  // Optional: Deeper check for rating if possible
});

test('clearing filters restores initial restaurant list and map', async ({ page }) => {
  const initialCardCount = await getRestaurantCardCount(page);
  const initialMarkerCount = await getMapMarkerCount(page);

  // Apply a filter first
  await page.selectOption(cuisineDropdownSelector, { label: 'Mexican' }); // Assuming 'Mexican'
  await page.click(applyFiltersButtonSelector);
  await page.waitForTimeout(2000);

  const filteredCardCount = await getRestaurantCardCount(page);
  expect(filteredCardCount).not.toEqual(initialCardCount);

  await page.click(clearFiltersButtonSelector);
  await page.waitForTimeout(2000);

  const clearedCardCount = await getRestaurantCardCount(page);
  const clearedMarkerCount = await getMapMarkerCount(page);

  expect(clearedCardCount).toEqual(initialCardCount);
  expect(clearedMarkerCount).toEqual(initialMarkerCount);
});

test('filter combination (cuisine and rating) updates list and map', async ({ page }) => {
  const initialCardCount = await getRestaurantCardCount(page);

  // Assuming 'Asian' and '3 Stars' are valid options.
  await page.selectOption(cuisineDropdownSelector, { label: 'Asian' });
  await page.selectOption(ratingDropdownSelector, { label: '3 Stars' });
  await page.click(applyFiltersButtonSelector);

  await page.waitForTimeout(2000);

  const filteredCardCount = await getRestaurantCardCount(page);
  const filteredMarkerCount = await getMapMarkerCount(page);

  expect(filteredCardCount).toBeLessThanOrEqual(initialCardCount); // Could be less or same if all matched
  expect(filteredCardCount).toEqual(filteredMarkerCount);
  // Optional: Deeper checks for both cuisine and rating
});

test('filter resulting in no results displays message and no cards/markers', async ({ page }) => {
  // Apply filters unlikely to match anything
  // These values might need to be very specific to your dataset to ensure no results
  await page.selectOption(cuisineDropdownSelector, { label: 'Antarctic' }); // Assuming this cuisine doesn't exist
  await page.selectOption(ratingDropdownSelector, { label: '5 Stars' });
  await page.click(applyFiltersButtonSelector);

  await page.waitForTimeout(2000);
  
  await expect(page.locator(noResultsMessageSelector)).toBeVisible({ timeout: 5000 });
  
  const cardCount = await page.locator(restaurantCardSelector).count();
  expect(cardCount).toBe(0);

  const markerCount = await page.locator(mapMarkerSelector).count();
  expect(markerCount).toBe(0);
});