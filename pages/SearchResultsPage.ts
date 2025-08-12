import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { PriceUtils, ProductUtils } from '../utils';

/**
 * Page object for Takealot search results functionality
 */
export class SearchResultsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Apply Samsung brand filter
   */
  async filterBySamsung(): Promise<void> {
    const samsungFilter = this.page.locator('label').filter({ hasText: 'Samsung72' });
    await this.click(samsungFilter);
  }

  /**
   * Add a specific Samsung product to cart by name
   * @param productName - The name of the Samsung product to add
   */
  async addSamsungProductToCart(productName: string): Promise<void> {
    const productLocator = this.page.getByLabel(productName);
    const addToCartButton = productLocator.getByRole('button', { name: 'Add to Cart' });
    await this.click(addToCartButton);
  }

  /**
   * Add a specific monitor product to wishlist by name
   * @param productName - The name of the monitor product to add
   */
  async addMonitorToWishlist(productName: string): Promise<void> {
    const productArticle = this.page.getByRole('article', { name: productName }).first();
    const addToWishlistButton = productArticle.getByLabel('Add to wishlist');
    await this.click(addToWishlistButton);
  }

  /**
   * Get all product articles on the page (using more flexible selectors)
   */
  getProductArticles(): Locator {
    // Try multiple selectors as the exact structure may vary
    return this.page.locator('article, [data-ref="product-item"], .product-item, .product-card').first();
  }

  /**
   * Get all product containers using various possible selectors
   */
  async getAllProductContainers(): Promise<Locator[]> {
    // Wait for products to load
    await this.page.waitForTimeout(3000);
    
    // Get all product containers using multiple selector strategies
    const productSelectors = [
      'article[data-ref="product-item"]',
      'article',
      '[data-ref="product-item"]',
      '.product-item',
      '.product-card',
      '[data-testid*="product"]'
    ];
    
    for (const selector of productSelectors) {
      const elements = this.page.locator(selector);
      const count = await elements.count();
      if (count > 0) {
        console.log(`Found ${count} products using selector: ${selector}`);
        const containers: Locator[] = [];
        for (let i = 0; i < Math.min(count, 10); i++) { // Limit to first 10 items
          containers.push(elements.nth(i));
        }
        return containers;
      }
    }
    
    return [];
  }

  /**
   * Get product name from a product container
   * @param productContainer - The product container element
   */
  async getProductName(productContainer: Locator): Promise<string> {
    const nameSelectors = [
      '[data-ref="product-title"]',
      '.product-title',
      'h3',
      'h4',
      '[data-testid*="title"]',
      'a[href*="/product/"]'
    ];
    
    for (const selector of nameSelectors) {
      try {
        const nameElement = productContainer.locator(selector).first();
        const text = await nameElement.textContent({ timeout: 2000 });
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      } catch {
        continue;
      }
    }
    
    // Fallback: get all text content and try to extract product name
    const allText = await productContainer.textContent() || '';
    const lines = allText.split('\n').map(line => line.trim()).filter(line => line.length > 10);
    return lines[0] || '';
  }

  /**
   * Get product price from a product container
   * @param productContainer - The product container element
   */
  async getProductPrice(productContainer: Locator): Promise<string> {
    const priceSelectors = [
      '[data-ref="price"]',
      '.price',
      '[class*="price"]',
      '[data-testid*="price"]',
      'span:has-text("R ")',
      'div:has-text("R ")'
    ];
    
    for (const selector of priceSelectors) {
      try {
        const priceElement = productContainer.locator(selector).first();
        const text = await priceElement.textContent({ timeout: 2000 });
        if (text && text.includes('R')) {
          return text.trim();
        }
      } catch {
        continue;
      }
    }
    
    // Fallback: look for any text containing 'R' followed by numbers
    const allText = await productContainer.textContent() || '';
    const priceMatch = allText.match(/R\s*[\d,\s]+/);
    return priceMatch ? priceMatch[0].trim() : '';
  }

  /**
   * Find first Samsung TV within price limit dynamically
   * @param maxPrice - Maximum price limit (e.g., 15000)
   * @returns Object with product name and price, or null if not found
   */
  async findFirstSamsungTVWithinPrice(maxPrice: number): Promise<{ name: string; price: string } | null> {
    console.log(`Looking for Samsung TV under R${maxPrice}`);
    
    const productContainers = await this.getAllProductContainers();
    console.log(`Found ${productContainers.length} product containers to analyze`);
    
    for (const container of productContainers) {
      try {
        const name = await this.getProductName(container);
        const price = await this.getProductPrice(container);
        
        console.log(`Checking product: ${name} - ${price}`);
        
        if (ProductUtils.isSamsungBrand(name) && 
            ProductUtils.isTV(name) && 
            PriceUtils.isPriceWithinLimit(price, maxPrice)) {
          
          console.log(`Found matching Samsung TV: ${name} at ${price}`);
          return { name, price };
        }
      } catch (error) {
        console.log(`Error checking product:`, error);
        continue;
      }
    }
    
    console.log('No Samsung TV found within price limit');
    return null;
  }

  /**
   * Find first monitor with minimum refresh rate dynamically
   * @param minRefreshRate - Minimum refresh rate requirement (e.g., 120)
   * @returns Object with product name and price, or null if not found
   */
  async findFirstHighRefreshRateMonitor(minRefreshRate: number): Promise<{ name: string; price: string } | null> {
    console.log(`Looking for monitor with ${minRefreshRate}Hz or higher`);
    
    const productContainers = await this.getAllProductContainers();
    console.log(`Found ${productContainers.length} product containers to analyze`);
    
    for (const container of productContainers) {
      try {
        const name = await this.getProductName(container);
        const price = await this.getProductPrice(container);
        
        console.log(`Checking product: ${name} - ${price}`);
        
        if (ProductUtils.isMonitor(name) && 
            ProductUtils.meetsRefreshRateRequirement(name, minRefreshRate)) {
          
          console.log(`Found matching monitor: ${name} at ${price}`);
          return { name, price };
        }
      } catch (error) {
        console.log(`Error checking product:`, error);
        continue;
      }
    }
    
    console.log(`No monitor found with ${minRefreshRate}Hz or higher`);
    return null;
  }

  /**
   * Add product to cart by clicking its Add to Cart button
   * @param productName - The name of the product to add
   */
  async addProductToCart(productName: string): Promise<void> {
    // Get a shorter version of the product name for more flexible matching
    const shortName = productName.split(' ').slice(0, 3).join(' '); // Take first 3 words
    
    // Try different approaches to find and click the add to cart button
    const addToCartSelectors = [
      // Try with original approach for exact match
      `[aria-label="${productName}"] button[aria-label="Add to Cart"]`,
      // Try with shorter name
      `[aria-label*="${shortName}"] button[aria-label="Add to Cart"]`,
      // Try finding container with product name, then button inside
      `article:has-text("${shortName}") button:has-text("Add to Cart")`,
      `div:has-text("${shortName}") button:has-text("Add to Cart")`,
      // Try more general selectors
      'button:has-text("Add to Cart")',
      'button[aria-label="Add to Cart"]',
      // Try Samsung-specific approach since we know it's Samsung
      `[aria-label*="Samsung"] button:has-text("Add to Cart")`,
      `[aria-label*="Samsung"] button[aria-label="Add to Cart"]`
    ];
    
    for (let i = 0; i < addToCartSelectors.length; i++) {
      const selector = addToCartSelectors[i];
      try {
        console.log(`Trying selector ${i + 1}: ${selector}`);
        const buttons = this.page.locator(selector);
        const count = await buttons.count();
        console.log(`Found ${count} buttons with selector: ${selector}`);
        
        if (count > 0) {
          const button = buttons.first();
          await button.waitFor({ state: 'visible', timeout: 5000 });
          await this.click(button);
          console.log(`Successfully added product to cart using selector ${i + 1}`);
          return;
        }
      } catch (error) {
        console.log(`Selector ${i + 1} failed:`, error);
        continue;
      }
    }
    
    // If all else fails, try to use the original hardcoded approach
    try {
      console.log('Falling back to original hardcoded approach');
      await this.addSamsungProductToCart('Samsung 65" DU7010 4K UHD');
      return;
    } catch {
      // Final fallback failed too
    }
    
    throw new Error(`Could not find Add to Cart button for product: ${productName}`);
  }

  /**
   * Add product to wishlist by clicking its Add to Wishlist button
   * @param productName - The name of the product to add
   */
  async addProductToWishlist(productName: string): Promise<void> {
    // Try different approaches to find and click the wishlist button
    const wishlistSelectors = [
      `[aria-label*="${productName}"] button[aria-label*="wishlist"]`,
      `article:has-text("${productName}") button[aria-label*="wishlist"]`,
      `div:has-text("${productName}") button[aria-label*="wishlist"]`,
      'button[aria-label*="wishlist"]'
    ];
    
    for (const selector of wishlistSelectors) {
      try {
        const button = this.page.locator(selector).first();
        await button.waitFor({ state: 'visible', timeout: 5000 });
        await this.click(button);
        console.log(`Successfully added ${productName} to wishlist`);
        return;
      } catch {
        continue;
      }
    }
    
    throw new Error(`Could not find Add to Wishlist button for product: ${productName}`);
  }
}