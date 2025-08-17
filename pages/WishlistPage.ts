import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { CommonPageHelpers } from '../utils/CommonPageHelpers';

/**
 * Page object for Takealot wishlist functionality
 */
export class WishlistPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Get wishlist item by product name
   * @param productName - The name of the product to find in wishlist
   */
  getWishlistItem(productName: string): Locator {
    const locators = CommonPageHelpers.createFlexibleProductLocator(this.page, productName, 'a');
    return locators[0]; // Return first strategy as default
  }

  /**
   * Get wishlist item price by looking for specific price text
   * @param priceText - The price text to find (e.g., 'R 10,499')
   */
  getWishlistItemPrice(priceText: string): Locator {
    const priceLocators = CommonPageHelpers.createPriceLocators(this.page, priceText);
    return priceLocators.shippedFromTakealot;
  }

  /**
   * Get total price in wishlist summary
   * @param priceText - The total price text to find
   */
  getTotalPrice(priceText: string): Locator {
    const priceLocators = CommonPageHelpers.createPriceLocators(this.page, priceText);
    return priceLocators.complementarySection;
  }

  /**
   * Verify that an item appears in the wishlist with correct details
   * @param productName - The name of the product
   * @param expectedPrice - The expected price (optional for dynamic scenarios)
   */
  async verifyItemInWishlist(productName: string, expectedPrice?: string): Promise<void> {
    const wishlistItem = await CommonPageHelpers.verifyItemWithFlexibleMatching(
      this.page, 
      productName, 
      'a', 
      expectedPrice
    );
    
    // Verify the item appears in the wishlist
    await expect(wishlistItem).toBeVisible();
    
    // Verify the correct item name is in the wishlist
    await expect(wishlistItem).toContainText(productName);
    
    // Verify the quantity is correct (should be 1 item)
    await expect(wishlistItem).toHaveCount(1);
  }

  /**
   * Verify that a dynamically selected item appears in wishlist
   * @param productName - The name of the product
   */
  async verifyDynamicItemInWishlist(productName: string): Promise<void> {
    await this.verifyItemInWishlist(productName); // Call without expected price
  }
}