import { test, expect } from '@playwright/test';

/*
 * Test suite for basic e-commerce functionalities
 * Includes tests for cart and wishlist features
 * Tests are designed to validate key user interactions
 * Tests are written in a straightforward manner using locators and assertions
 */

test('Verify cart functionality - basic approach', async ({ page }) => {
  test.setTimeout(60000); // Increase timeout to 1 minute
  // Navigate to Takealot homepage
  await page.goto('https://www.takealot.com/');
  
  // Dismiss any notifications/popups
  try {
    await page.getByRole('button', { name: 'NOT NOW' }).click({ timeout: 15000 });
  } catch {
    // Ignore if no notification banner
  }
  
  // Search for 65" TV
  await page.getByRole('textbox', { name: 'Search for products, brands...' }).click();
  await page.getByRole('textbox', { name: 'Search for products, brands...' }).fill('65 tv');
  await page.getByRole('textbox', { name: 'Search for products, brands...' }).press('Enter');
  // Wait for search results to load
  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.waitForLoadState('domcontentloaded')
  ]);
  await page.waitForLoadState('networkidle');
  
  // Filter by Samsung brand
  await page.locator('text=Samsung').first().click();
  await page.waitForLoadState('networkidle');
  
  // Find the specific Samsung product & Add to Cart
  await page.getByLabel('Samsung 65" DU7010 4K UHD').getByRole('button', { name: 'Add to Cart' }).click();
  
  // Navigate to cart
  await page.getByRole('link', { name: 'Go to Cart' }).click();

  // Wait for cart page to load
  await page.waitForLoadState('networkidle');
  
  // Verify item is in cart
  const cartItem = page.locator('a').filter({ hasText: 'Samsung 65" DU7010 4K UHD' });
  await expect(cartItem).toBeVisible();

    // Verify the correct item is in the cart
  await expect(cartItem).toContainText('Samsung 65" DU7010 4K UHD');

  // Verify the price is correct
  const cartItemPrice = page.getByLabel('Shipped from Takealot').getByText('R 10,499');
  await expect(cartItemPrice).toBeVisible();

  // Verify the quantity is correct
  await expect(cartItem).toHaveCount(1);

  // Verify the total price in the cart
  const totalPrice = page.getByRole('complementary').getByText('R 10,499');
  await expect(totalPrice).toBeVisible();
});

test('Verify wishlist functionality - basic approach', async ({ page }) => {
  // Navigate to Takealot homepage
  await page.goto('https://www.takealot.com/');
  
  // Dismiss any notifications/popups
  try {
    await page.getByRole('button', { name: 'NOT NOW' }).click({ timeout: 15000 });
  } catch {
    // Ignore if no notification banner
  }
  
  // Search for 120Hz Monitor
  await page.getByRole('textbox', { name: 'Search for products, brands...' }).click();
  await page.getByRole('textbox', { name: 'Search for products, brands...' }).fill('120HZ Monitor');
  await page.getByRole('textbox', { name: 'Search for products, brands...' }).press('Enter');
  
  // Wait for search results to load
  await page.waitForLoadState('networkidle');
  
  // Find the specific MSI monitor & Add To Wishlist
  await page.getByRole('article', { name: 'MSI PERFECTEDGE PRO 25" FHD' }).getByLabel('Add to wishlist').click();

  // Navigate to wishlist
  await page.getByRole('link', { name: 'wishlist' }).click();
  
  // Wait for wishlist page to load
  await page.waitForLoadState('networkidle');
  
  // Verify the item appears in the wishlist
  const wishlistItem = page.locator('a').filter({ hasText: 'MSI PERFECTEDGE PRO 25" FHD' });
  await expect(wishlistItem).toBeVisible();

  // Verify the correct item is in the wishlist
  await expect(wishlistItem).toContainText('MSI PERFECTEDGE PRO 25" FHD');

  // Verify the price is correct
  const wishlistItemPrice = page.locator('section').filter({ hasText: 'Wish ListdefaultYou are' }).getByText('R 2,999');
  await expect(wishlistItemPrice).toBeVisible();

  // Verify the quantity is correct
  await expect(wishlistItem).toHaveCount(1);
});