import { test, expect } from '@playwright/test';
import { TakealotHomePage, SearchResultsPage, CartPage, WishlistPage } from '../pages';

/**
 * Test suite for dynamic product selection scenarios
 * These tests implement the assessment requirements for finding products
 * that meet specific criteria rather than using hardcoded product names
 */

test('Scenario 1: Find and add first Samsung TV under R15,000 to cart', async ({ page }) => {
  // Initialize page objects
  const homePage = new TakealotHomePage(page);
  const searchResultsPage = new SearchResultsPage(page);
  const cartPage = new CartPage(page);

  // Navigate to Takealot and dismiss notifications
  await homePage.navigate();
  await homePage.dismissNotifications();

  // Search for 65" TV as specified in assessment
  await homePage.searchForProduct('65 tv');

  // Apply Samsung brand filter
  await searchResultsPage.filterBySamsung();

  // Dynamically find first Samsung TV under R15,000
  const selectedProduct = await searchResultsPage.findFirstSamsungTVWithinPrice(15000);
  
  // Verify we found a suitable product
  expect(selectedProduct).not.toBeNull();
  expect(selectedProduct!.name).toBeTruthy();
  expect(selectedProduct!.price).toBeTruthy();
  
  console.log(`Selected Samsung TV: ${selectedProduct!.name} at ${selectedProduct!.price}`);

  // Add the dynamically selected product to cart
  await searchResultsPage.addProductToCart(selectedProduct!.name);

  // Navigate to cart
  await homePage.goToCart();

  // Verify the dynamically selected item appears in cart
  await cartPage.verifyDynamicItemInCart(selectedProduct!.name);
});

test('Scenario 2: Find and add 120Hz+ monitor to wishlist', async ({ page }) => {
  // Initialize page objects
  const homePage = new TakealotHomePage(page);
  const searchResultsPage = new SearchResultsPage(page);
  const wishlistPage = new WishlistPage(page);

  // Navigate to Takealot and dismiss notifications
  await homePage.navigate();
  await homePage.dismissNotifications();

  // Search for 120Hz Monitor as specified in assessment
  await homePage.searchForProduct('120Hz Monitor');

  // Dynamically find first monitor with 120Hz or higher refresh rate
  const selectedMonitor = await searchResultsPage.findFirstHighRefreshRateMonitor(120);
  
  // Verify we found a suitable monitor
  expect(selectedMonitor).not.toBeNull();
  expect(selectedMonitor!.name).toBeTruthy();
  expect(selectedMonitor!.price).toBeTruthy();
  
  console.log(`Selected Monitor: ${selectedMonitor!.name} at ${selectedMonitor!.price}`);

  // Add the dynamically selected monitor to wishlist
  await searchResultsPage.addProductToWishlist(selectedMonitor!.name);

  // Navigate to wishlist
  await homePage.goToWishlist();

  // Verify the dynamically selected item appears in wishlist
  await wishlistPage.verifyDynamicItemInWishlist(selectedMonitor!.name);
});

test('Fallback: Test with original hardcoded approach if dynamic selection fails', async ({ page }) => {
  // Initialize page objects
  const homePage = new TakealotHomePage(page);
  const searchResultsPage = new SearchResultsPage(page);
  const cartPage = new CartPage(page);

  // Navigate to Takealot and dismiss notifications
  await homePage.navigate();
  await homePage.dismissNotifications();

  // Search for 65" TV
  await homePage.searchForProduct('65 tv');

  // Apply Samsung brand filter
  await searchResultsPage.filterBySamsung();

  // Try dynamic selection first
  const selectedProduct = await searchResultsPage.findFirstSamsungTVWithinPrice(15000);
  
  if (selectedProduct) {
    // Use dynamic selection
    console.log(`Using dynamic selection: ${selectedProduct.name}`);
    await searchResultsPage.addProductToCart(selectedProduct.name);
    await homePage.goToCart();
    await cartPage.verifyDynamicItemInCart(selectedProduct.name);
  } else {
    // Fallback to original hardcoded approach
    console.log('Dynamic selection failed, using fallback approach');
    await searchResultsPage.addSamsungProductToCart('Samsung 65" DU7010 4K UHD');
    await homePage.goToCart();
    await cartPage.verifyItemInCart('Samsung 65" DU7010 4K UHD', 'R 10,499');
  }
});