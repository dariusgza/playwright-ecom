import { test, expect } from '@playwright/test';
import { TakealotHomePage, SearchResultsPage, CartPage, WishlistPage } from '../pages';

test('Verify cart functionality', async ({ page }) => {
  // Initialize page objects
  const homePage = new TakealotHomePage(page);
  const searchResultsPage = new SearchResultsPage(page);
  const cartPage = new CartPage(page);

  // Navigate to Takealot and dismiss notifications
  await homePage.navigate();
  await homePage.dismissNotifications();

  // Search for 65" TV
  await homePage.searchForProduct('65 tv');

  // Filter results by Samsung brand
  await searchResultsPage.filterBySamsung();

  // Add the specific Samsung product to cart
  await searchResultsPage.addSamsungProductToCart('Samsung 65" DU7010 4K UHD');

  // Navigate to cart
  await homePage.goToCart();

  // Verify the item appears in cart with correct details
  await cartPage.verifyItemInCart('Samsung 65" DU7010 4K UHD', 'R 10,499');
});

test('Verify the wishlist functionality', async ({ page }) => {
  // Initialize page objects
  const homePage = new TakealotHomePage(page);
  const searchResultsPage = new SearchResultsPage(page);
  const wishlistPage = new WishlistPage(page);

  // Navigate to Takealot and dismiss notifications
  await homePage.navigate();
  await homePage.dismissNotifications();

  // Search for 120Hz Monitor
  await homePage.searchForProduct('120HZ Monitor');

  // Add the specific MSI monitor to wishlist
  await searchResultsPage.addMonitorToWishlist('MSI PERFECTEDGE PRO 25" FHD');

  // Navigate to wishlist
  await homePage.goToWishlist();

  // Verify the item appears in wishlist with correct details
  await wishlistPage.verifyItemInWishlist('MSI PERFECTEDGE PRO 25" FHD', 'R 10,499');
});
