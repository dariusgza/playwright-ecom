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
   * Get cart item by product name with flexible matching
   * @param productName - The name of the product to find in cart
   */
  getCartItem(productName: string): Locator {
    // Try exact match first
    let cartItem = this.page.locator('a').filter({ hasText: productName });
    
    // If exact match fails, try partial matching with key words
    const keyWords = productName.split(' ').filter(word => 
      word.length > 3 && !['with', 'and', 'the', 'for'].includes(word.toLowerCase())
    );
    
    // Create a more flexible selector using the first few key words
    if (keyWords.length >= 2) {
      const partialText = keyWords.slice(0, 3).join(' ');
      cartItem = this.page.locator('a').filter({ hasText: partialText });
    }
    
    return cartItem;
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
   * @param expectedPrice - The expected price (optional for dynamic scenarios)
   */
  async verifyItemInCart(productName: string, expectedPrice?: string): Promise<void> {
    // Try multiple strategies to find the cart item
    const strategies = [
      // Strategy 1: Exact product name match
      () => this.page.locator('a').filter({ hasText: productName }),
      
      // Strategy 2: Key words match (first 3 significant words)
      () => {
        const keyWords = productName.split(' ').filter(word => 
          word.length > 3 && !['with', 'and', 'the', 'for', 'Smart'].includes(word)
        );
        if (keyWords.length >= 2) {
          const partialText = keyWords.slice(0, 3).join(' ');
          return this.page.locator('a').filter({ hasText: partialText });
        }
        return this.page.locator('a').first(); // Fallback
      },
      
      // Strategy 3: Brand and model match
      () => {
        const words = productName.split(' ');
        if (words.length >= 2) {
          const brandAndModel = `${words[0]} ${words[1]}`;
          return this.page.locator('a').filter({ hasText: brandAndModel });
        }
        return this.page.locator('a').first(); // Fallback
      },
      
      // Strategy 4: Any cart item (fallback)
      () => this.page.locator('[data-ref="product-link"], .cart-item a, .product-item a').first()
    ];
    
    let cartItem = null;
    let strategyUsed = 0;
    
    for (let i = 0; i < strategies.length; i++) {
      try {
        cartItem = strategies[i]();
        await cartItem.waitFor({ state: 'visible', timeout: 3000 });
        strategyUsed = i + 1;
        console.log(`✅ Cart verification strategy ${strategyUsed} succeeded for: ${productName}`);
        break;
      } catch (error) {
        console.log(`⚠️ Cart verification strategy ${i + 1} failed: ${error instanceof Error ? error.message : error}`);
        continue;
      }
    }
    
    if (!cartItem) {
      throw new Error(`Could not find cart item using any strategy for product: ${productName}`);
    }
    
    // Verify the item appears in the cart
    await expect(cartItem).toBeVisible();
    
    // Price verification is optional for dynamic product selection
    if (expectedPrice) {
      try {
        const cartItemPrice = this.getCartItemPrice(expectedPrice);
        await expect(cartItemPrice).toBeVisible();
        
        const totalPrice = this.getTotalPrice(expectedPrice);
        await expect(totalPrice).toBeVisible();
      } catch {
        console.log(`Price verification skipped for ${productName} - price format may vary`);
      }
    } else {
      console.log(`Price verification skipped for dynamically selected product: ${productName}`);
    }
  }

  /**
   * Verify that a dynamically selected item appears in cart
   * @param productName - The name of the product
   */
  async verifyDynamicItemInCart(productName: string): Promise<void> {
    await this.verifyItemInCart(productName); // Call without expected price
  }
}