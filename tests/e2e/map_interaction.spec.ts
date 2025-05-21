import { test, expect } from '@playwright/test';

const mapMarkerSelector = '.leaflet-marker-icon';
const restaurantCardSelector = '.restaurant-card';
const leafletPopupContentSelector = '.leaflet-popup-content';
const mapSelector = '.leaflet-container'; // Selector for the map container itself
const zoomInButtonSelector = '.leaflet-control-zoom-in';

// Helper to get map center
const getMapCenter = async (page) => {
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

// Helper to get zoom level
const getMapZoom = async (page) => {
  return await page.evaluate(() => {
    // @ts-expect-error Accessing Leaflet's internal map object
    const mapInstance = (document.querySelector('.leaflet-container') as unknown)?._leaflet_map;
    if (mapInstance) {
      return mapInstance.getZoom();
    }
    return null;
  });
};

test('map container and tiles load correctly', async ({ page }) => {
  await page.goto('/');
  // Check if map container is rendered
  await expect(page.locator(mapSelector)).toBeVisible({ timeout: 10000 });
  // Check if map tiles are loaded
  await expect(page.locator('.leaflet-tile').first()).toBeVisible({ timeout: 5000 });
});

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // Wait for map and initial markers to load
  // The 'map container and tiles load correctly' test now covers initial map visibility.
  // So we only need to wait for markers and cards here.
  // The 'map container and tiles load correctly' test now covers initial map visibility.
  // So we only need to wait for markers and cards here.
  await expect(page.locator(mapMarkerSelector).first()).toBeVisible({ timeout: 15000 });
  await expect(page.locator(restaurantCardSelector).first()).toBeVisible({ timeout: 15000 });
});

test('clicking a map marker highlights card and shows popup', async ({ page }) => {
  const firstMarker = page.locator(mapMarkerSelector).first();
  
  // Assumption: Markers have a data attribute linking them to restaurant IDs,
  // and cards also have a way to be identified (e.g., an ID like `restaurant-card-${id}`)
  // For simplicity, this test will check for *any* card becoming selected/highlighted
  // and *any* popup appearing. More specific association would require known attributes.

  // Click the marker
  await firstMarker.click({ force: true }); // force:true can be needed if something overlaps slightly

  // Assertion 1: Verify that a restaurant card is highlighted
  // This assumes a 'selected' or 'highlighted' class is added to the card.
  // We might need to wait for this class to appear.
  const highlightedCard = page.locator(`${restaurantCardSelector}.selected, ${restaurantCardSelector}.highlighted`);
  await expect(highlightedCard.first()).toBeVisible({ timeout: 5000 });

  // Assertion 2: Verify that a popup appears and displays some information
  const popupContent = page.locator(leafletPopupContentSelector);
  await expect(popupContent).toBeVisible({ timeout: 2000 });
  // Check if the popup has some text. This is a generic check.
  await expect(popupContent.first()).not.toBeEmpty(); 
  // Example: Check if it contains the name of the restaurant (if a name is available in the popup)
  // const restaurantNameOnCard = await highlightedCard.locator('h3').textContent();
  // if (restaurantNameOnCard) {
  //   await expect(popupContent.first()).toContainText(restaurantNameOnCard, { timeout: 1000 });
  // }
});

test('map zoom functionality updates view', async ({ page }) => {
  // Removed unused variable initialMarkerCount
  const initialZoom = await getMapZoom(page);
  expect(initialZoom).not.toBeNull();

  // Simulate a zoom-in action
  const zoomInButton = page.locator(zoomInButtonSelector);
  await expect(zoomInButton).toBeVisible();
  await zoomInButton.click();
  await page.waitForTimeout(1000); // Wait for map to re-render and potentially new markers

  const newZoom = await getMapZoom(page);
  expect(newZoom).not.toBeNull();
  if (initialZoom !== null && newZoom !== null) { // Make TypeScript happy
      expect(newZoom).toBeGreaterThan(initialZoom);
  }


  // Assert that markers are still visible
  await expect(page.locator(mapMarkerSelector).first()).toBeVisible({ timeout: 5000 });
  const newMarkerCount = await page.locator(mapMarkerSelector).count();
  // The marker count might change due to clustering or loading more/fewer markers.
  // So, we primarily check that some markers are visible.
  expect(newMarkerCount).toBeGreaterThan(0); 
});

test('map pan functionality changes map center', async ({ page }) => {
  const initialCenter = await getMapCenter(page);
  expect(initialCenter).not.toBeNull();

  // Simulate a pan action on the map
  const mapElement = page.locator(mapSelector);
  const boundingBox = await mapElement.boundingBox();
  expect(boundingBox).not.toBeNull();

  if (boundingBox) {
    const startX = boundingBox.x + boundingBox.width / 2;
    const startY = boundingBox.y + boundingBox.height / 2;
    
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 100, startY + 50, { steps: 5 }); // Pan right and down
    await page.mouse.up();
  }

  await page.waitForTimeout(1000); // Wait for map to settle

  const newCenter = await getMapCenter(page);
  expect(newCenter).not.toBeNull();

  // Assert that the new map center is different from the initial map center
  expect(newCenter?.lat).not.toEqual(initialCenter?.lat);
  // Depending on the pan direction, lng might also change or primarily lat.
  // For a diagonal pan like above, both should ideally change.
  expect(newCenter?.lng).not.toEqual(initialCenter?.lng);

  // Assert that markers are still visible
  await expect(page.locator(mapMarkerSelector).first()).toBeVisible({ timeout: 5000 });
  expect(await page.locator(mapMarkerSelector).count()).toBeGreaterThan(0);
});