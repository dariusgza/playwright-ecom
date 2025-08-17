import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { CommonPageHelpers } from '../utils/CommonPageHelpers';

/**
 * Page object for Takealot cart functionality
 */
export class CartPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Get cart item by product name with flexible matching
   * @param productName - The name of the product to find in cart
   */
  getCartItem(productName: string): Locator {
    const locators = CommonPageHelpers.createFlexibleProductLocator(this.page, productName, 'a');
    return locators[0]; // Return first strategy as default
  }

  /**
   * Get cart item price by looking for specific price text
   * @param priceText - The price text to find (e.g., 'R 10,499')
   */
  getCartItemPrice(priceText: string): Locator {
    const priceLocators = CommonPageHelpers.createPriceLocators(this.page, priceText);
    return priceLocators.shippedFromTakealot;
  }

  /**
   * Get total price in cart summary
   * @param priceText - The total price text to find
   */
  getTotalPrice(priceText: string): Locator {
    const priceLocators = CommonPageHelpers.createPriceLocators(this.page, priceText);
    return priceLocators.complementarySection;
  }

  /**
   * Verify that an item appears in the cart with correct details
   * @param productName - The name of the product
   * @param expectedPrice - The expected price (optional for dynamic scenarios)
   */
  async verifyItemInCart(productName: string, expectedPrice?: string): Promise<void> {
    const cartItem = await CommonPageHelpers.verifyItemWithFlexibleMatching(
      this.page, 
      productName, 
      'a', 
      expectedPrice
    );
    
    // Verify the item appears in the cart
    await expect(cartItem).toBeVisible();
  }

  /**
   * Verify that a dynamically selected item appears in cart
   * @param productName - The name of the product
   */
  async verifyDynamicItemInCart(productName: string): Promise<void> {
    await this.verifyItemInCart(productName); // Call without expected price
  }
}