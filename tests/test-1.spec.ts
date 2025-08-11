import { test, expect } from '@playwright/test';

test('Verify cart functionality', async ({ page }) => {
  await page.goto('https://www.takealot.com/');
  await page.getByRole('textbox', { name: 'Search for products, brands...' }).click();
  await page.getByRole('button', { name: 'NOT NOW' }).click();
  await page.getByRole('textbox', { name: 'Search for products, brands...' }).click();
  await page.getByRole('textbox', { name: 'Search for products, brands...' }).fill('65 tv');
  await page.getByRole('textbox', { name: 'Search for products, brands...' }).press('Enter');
  await page.locator('label').filter({ hasText: 'Samsung72' }).click();
  await page.getByLabel('Samsung 65" DU7010 4K UHD').getByRole('button', { name: 'Add to Cart' }).click();
  await page.getByRole('link', { name: 'Go to Cart' }).click();

  // Verify the item appears in the cart
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

test('Verify the wishlist functionality', async ({ page }) => {
  await page.goto('https://www.takealot.com/');
  await page.getByRole('textbox', { name: 'Search for products, brands...' }).click();
  await page.getByRole('button', { name: 'NOT NOW' }).click();
  await page.getByRole('textbox', { name: 'Search for products, brands...' }).click();
  await page.getByRole('textbox', { name: 'Search for products, brands...' }).fill('120HZ Monitor');
  await page.getByRole('textbox', { name: 'Search for products, brands...' }).press('Enter');
  await page.getByRole('article', { name: 'MSI PERFECTEDGE PRO 25" FHD' }).getByLabel('Add to wishlist').click();
  await page.getByRole('link', { name: 'wishlist' }).click();

  // Verify the item appears in the wishlist
  const wishlistItem = page.locator('a').filter({ hasText: 'MSI PERFECTEDGE PRO 25" FHD' });
  await expect(wishlistItem).toBeVisible();

  // Verify the correct item is in the wishlist
  await expect(wishlistItem).toContainText('MSI PERFECTEDGE PRO 25" FHD');

  // Verify the price is correct
  const wishlistItemPrice = page.getByLabel('Shipped from Takealot').getByText('R 10,499');
  await expect(wishlistItemPrice).toBeVisible();

  // Verify the quantity is correct
  await expect(wishlistItem).toHaveCount(1);

  // Verify the total price in the wishlist
  const totalPrice = page.getByRole('complementary').getByText('R 10,499');
  await expect(totalPrice).toBeVisible();
});
