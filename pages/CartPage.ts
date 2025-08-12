import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for Takealot cart functionality
 */
export class CartPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Get cart item by product name
   * @param productName - The name of the product to find in cart
   */
  getCartItem(productName: string): Locator {
    return this.page.locator('a').filter({ hasText: productName });
  }

  /**
   * Get cart item price by looking for specific price text
   * @param priceText - The price text to find (e.g., 'R 10,499')
   */
  getCartItemPrice(priceText: string): Locator {
    return this.page.getByLabel('Shipped from Takealot').getByText(priceText);
  }

  /**
   * Get total price in cart summary
   * @param priceText - The total price text to find
   */
  getTotalPrice(priceText: string): Locator {
    return this.page.getByRole('complementary').getByText(priceText);
  }

  /**
   * Verify that an item appears in the cart with correct details
   * @param productName - The name of the product
   * @param expectedPrice - The expected price
   */
  async verifyItemInCart(productName: string, expectedPrice: string): Promise<void> {
    const cartItem = this.getCartItem(productName);
    
    // Verify the item appears in the cart
    await expect(cartItem).toBeVisible();
    
    // Verify the correct item name is in the cart
    await expect(cartItem).toContainText(productName);
    
    // Verify the price is correct
    const cartItemPrice = this.getCartItemPrice(expectedPrice);
    await expect(cartItemPrice).toBeVisible();
    
    // Verify the quantity is correct (should be 1 item)
    await expect(cartItem).toHaveCount(1);
    
    // Verify the total price in the cart
    const totalPrice = this.getTotalPrice(expectedPrice);
    await expect(totalPrice).toBeVisible();
  }
}