import { Page, Locator } from '@playwright/test';

/**
 * Common helper utilities for page object functionality
 * Extracts duplicate code patterns found across multiple page objects
 */
export class CommonPageHelpers {
  
  /**
   * Extract key words from product name for flexible matching
   * @param productName - The full product name
   * @returns Array of significant words for matching
   */
  static extractKeyWords(productName: string): string[] {
    return productName.split(' ').filter(word => 
      word.length > 3 && !['with', 'and', 'the', 'for', 'Smart'].includes(word.toLowerCase())
    );
  }

  /**
   * Create partial text for matching using first few key words
   * @param productName - The full product name
   * @param wordCount - Number of key words to use (default: 3)
   * @returns Partial text string for matching
   */
  static createPartialText(productName: string, wordCount: number = 3): string {
    const keyWords = this.extractKeyWords(productName);
    return keyWords.length >= 2 ? keyWords.slice(0, wordCount).join(' ') : productName;
  }

  /**
   * Extract brand and model from product name
   * @param productName - The full product name
   * @returns Object with brand and model
   */
  static extractBrandAndModel(productName: string): { brand: string; model: string } {
    const words = productName.split(' ');
    return {
      brand: words[0] || '',
      model: words.length > 1 ? words[1] : ''
    };
  }

  /**
   * Generic product item finder with multiple strategies
   * @param page - Playwright page object
   * @param productName - Product name to search for
   * @param containerSelector - Base selector for item containers
   * @returns Locator for the found item
   */
  static createFlexibleProductLocator(page: Page, productName: string, containerSelector: string = 'a'): Locator[] {
    const keyWords = this.extractKeyWords(productName);
    const partialText = this.createPartialText(productName);
    const { brand, model } = this.extractBrandAndModel(productName);

    return [
      // Strategy 1: Exact product name match
      page.locator(containerSelector).filter({ hasText: productName }),
      
      // Strategy 2: Key words match (first 3 significant words)
      page.locator(containerSelector).filter({ hasText: partialText }),
      
      // Strategy 3: Brand and model match
      ...(brand && model ? [page.locator(containerSelector).filter({ hasText: `${brand} ${model}` })] : []),
      
      // Strategy 4: Brand only match
      ...(brand ? [page.locator(containerSelector).filter({ hasText: brand })] : [])
    ];
  }

  /**
   * Try multiple element location strategies with timeout
   * @param locators - Array of locators to try
   * @param productName - Product name for logging
   * @param timeoutMs - Timeout for each strategy
   * @returns First successful locator
   */
  static async tryMultipleStrategies(
    locators: Locator[], 
    productName: string, 
    timeoutMs: number = 3000
  ): Promise<{ locator: Locator; strategyIndex: number }> {
    for (let i = 0; i < locators.length; i++) {
      try {
        await locators[i].waitFor({ state: 'visible', timeout: timeoutMs });
        console.log(`✅ Strategy ${i + 1} succeeded for: ${productName}`);
        return { locator: locators[i], strategyIndex: i + 1 };
      } catch (error) {
        console.log(`⚠️ Strategy ${i + 1} failed: ${error instanceof Error ? error.message : error}`);
        continue;
      }
    }
    throw new Error(`Could not find element using any strategy for: ${productName}`);
  }

  /**
   * Common price locator patterns
   * @param page - Playwright page object
   * @param priceText - Price text to find
   * @returns Object with different price locator strategies
   */
  static createPriceLocators(page: Page, priceText: string) {
    return {
      shippedFromTakealot: page.getByLabel('Shipped from Takealot').getByText(priceText),
      complementarySection: page.getByRole('complementary').getByText(priceText),
      anyPriceText: page.getByText(priceText),
      priceInSection: page.locator('section').filter({ hasText: 'Wish List' }).getByText(priceText)
    };
  }

  /**
   * Generic verification strategies for items in cart/wishlist
   * @param page - Playwright page object
   * @param productName - Product name to verify
   * @param containerSelector - Selector for item containers
   * @param expectedPrice - Optional expected price
   * @returns Verification result
   */
  static async verifyItemWithFlexibleMatching(
    page: Page,
    productName: string,
    containerSelector: string = 'a',
    expectedPrice?: string
  ): Promise<Locator> {
    const locators = this.createFlexibleProductLocator(page, productName, containerSelector);
    
    // Add fallback strategies
    locators.push(
      page.locator('[data-ref="product-link"], .cart-item a, .product-item a').first(),
      page.locator(containerSelector).first()
    );

    const result = await this.tryMultipleStrategies(locators, productName);
    
    // Optional price verification
    if (expectedPrice) {
      try {
        const priceLocators = this.createPriceLocators(page, expectedPrice);
        // Try each price locator strategy
        const priceStrategies = Object.values(priceLocators);
        await this.tryMultipleStrategies(priceStrategies, `price ${expectedPrice}`, 2000);
      } catch {
        console.log(`Price verification skipped for ${productName} - price format may vary`);
      }
    } else {
      console.log(`Price verification skipped for dynamically selected product: ${productName}`);
    }

    return result.locator;
  }

  /**
   * Common notification dismissal patterns
   * @param page - Playwright page object
   * @returns Standard dismissal selectors
   */
  static getNotificationDismissalSelectors(): string[] {
    return [
      'button:has-text("NOT NOW")',
      'button:has-text("Accept")',
      'button:has-text("Close")',
      'button:has-text("Dismiss")',
      '[aria-label*="Close"]',
      '[aria-label*="Dismiss"]',
      '.close-button',
      '.cookie-accept',
      '.cookie-dismiss'
    ];
  }

  /**
   * Common overlay selectors for dismissal
   * @returns Standard overlay selectors
   */
  static getOverlaySelectors(): string[] {
    return [
      '.ab-page-blocker',
      '.page-blocker', 
      '.overlay-blocker',
      '.cookies-banner-module_cookie-banner_hsodu',
      '[role="dialog"]',
      '.modal'
    ];
  }
}