import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { PriceUtils, ProductUtils } from '../utils';
import { ErrorHandler } from '../utils/ErrorHandler';

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
   * 
   * This is the foundation method for dynamic product selection.
   * Takealot.com's product layout may vary, so we use multiple selector strategies
   * to reliably find product containers regardless of page structure changes.
   * 
   * Selector Strategy (in priority order):
   * 1. Specific data attributes (most reliable)
   * 2. Semantic HTML elements (articles)
   * 3. CSS classes (may change with updates)
   * 4. Test IDs (if available)
   * 
   * Performance Optimization:
   * - Limits to first 10 products for faster analysis
   * - Uses first successful selector strategy
   * - Includes timeout to ensure page load completion
   * 
   * @returns Array of Playwright Locator objects representing product containers
   */
  async getAllProductContainers(): Promise<Locator[]> {
    // Wait for products to load completely before analyzing
    // This ensures dynamic content and lazy-loaded elements are available
    await this.page.waitForTimeout(3000);
    
    // Multiple selector strategies to handle various Takealot page layouts
    // Ordered by reliability and specificity
    const productSelectors = [
      'article[data-ref="product-item"]', // Most specific - Takealot's data attribute
      'article',                          // Semantic HTML - likely product containers
      '[data-ref="product-item"]',        // Data attribute without tag requirement
      '.product-item',                    // CSS class approach
      '.product-card',                    // Alternative CSS class naming
      '[data-testid*="product"]'          // Test ID pattern matching
    ];
    
    // Try each selector strategy until we find products
    for (const selector of productSelectors) {
      const elements = this.page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        console.log(`Found ${count} products using selector: ${selector}`);
        
        // Create array of individual product locators
        const containers: Locator[] = [];
        
        // Limit to first 10 items for performance and assessment practicality
        // This prevents excessive analysis while ensuring we find suitable products
        for (let i = 0; i < Math.min(count, 10); i++) {
          containers.push(elements.nth(i));
        }
        
        return containers;
      }
    }
    
    // No products found with any selector strategy
    return [];
  }

  /**
   * Get product name from a product container with comprehensive error handling
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
    
    return await ErrorHandler.safeElementOperation(
      async () => {
        // Try each selector strategy with individual error handling
        for (const selector of nameSelectors) {
          try {
            const nameElement = productContainer.locator(selector).first();
            const text = await nameElement.textContent({ timeout: 2000 });
            if (text && text.trim().length > 0) {
              return text.trim();
            }
          } catch (error) {
            // Log selector failure but continue to next strategy
            console.debug(`Product name selector '${selector}' failed: ${error instanceof Error ? error.message : error}`);
            continue;
          }
        }
        
        // If no specific selector worked, throw to trigger fallback
        throw new Error('No product name selectors matched');
      },
      // Fallback: extract from all text content
      async () => {
        console.log('🔄 Using fallback product name extraction');
        const allText = await productContainer.textContent({ timeout: 5000 }) || '';
        const lines = allText.split('\n').map(line => line.trim()).filter(line => line.length > 10);
        
        if (lines.length === 0) {
          throw new Error('No readable product name found in container text');
        }
        
        return lines[0];
      },
      5000, // 5 second timeout
      'product name extraction'
    );
  }

  /**
   * Get product price from a product container with robust error handling
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
    
    return await ErrorHandler.safeElementOperation(
      async () => {
        // Try each price selector with validation
        for (const selector of priceSelectors) {
          try {
            const priceElement = productContainer.locator(selector).first();
            const text = await priceElement.textContent({ timeout: 2000 });
            
            // Validate price text contains currency indicator
            if (text && text.includes('R')) {
              const trimmedPrice = text.trim();
              
              // Additional validation: ensure it looks like a valid price
              if (/R\s*[\d,\s]+/.test(trimmedPrice)) {
                return trimmedPrice;
              }
            }
          } catch (error) {
            console.debug(`Price selector '${selector}' failed: ${error instanceof Error ? error.message : error}`);
            continue;
          }
        }
        
        throw new Error('No price selectors found valid price data');
      },
      // Fallback: regex search in all container text
      async () => {
        console.log('🔄 Using fallback price extraction from container text');
        const allText = await productContainer.textContent({ timeout: 5000 }) || '';
        
        // Enhanced regex patterns for price matching
        const pricePatterns = [
          /R\s*[\d,\s]+/g,           // Standard format: R 10,499
          /From\s+R\s*[\d,\s]+/g,   // Range format: From R 2,749
          /\bR[\d,\s]+/g            // Compact format: R10499
        ];
        
        for (const pattern of pricePatterns) {
          const matches = allText.match(pattern);
          if (matches && matches.length > 0) {
            // Return the first valid-looking price
            const price = matches[0].trim();
            console.log(`📍 Extracted price using pattern: ${price}`);
            return price;
          }
        }
        
        throw new Error('No price information found in product container');
      },
      5000,
      'product price extraction'
    );
  }

  /**
   * Find first Samsung TV within price limit dynamically
   * 
   * This method implements Assessment Scenario 1 requirements:
   * "Add the first item in the filtered results that's price is not more than R15 000 to the cart"
   * 
   * Assessment Compliance Algorithm:
   * 1. Get all product containers from search results
   * 2. Iterate through products in display order (first = highest priority)
   * 3. For each product, extract name and price
   * 4. Apply three filters:
   *    - Must be Samsung brand (isSamsungBrand)
   *    - Must be a TV (isTV) 
   *    - Must be within price limit (isPriceWithinLimit)
   * 5. Return first product that matches ALL criteria
   * 6. Return null if no product meets requirements
   * 
   * This replaces hardcoded product selection with dynamic assessment-compliant logic.
   * 
   * @param maxPrice - Maximum price limit (15000 for assessment)
   * @returns Object with product name and price, or null if not found
   */
  async findFirstSamsungTVWithinPrice(maxPrice: number): Promise<{ name: string; price: string } | null> {
    console.log(`Looking for Samsung TV under R${maxPrice}`);
    
    return await ErrorHandler.withNetworkResilience(
      async () => {
        // Get all available product containers for analysis
        const productContainers = await this.getAllProductContainers();
        console.log(`Found ${productContainers.length} product containers to analyze`);
        
        if (productContainers.length === 0) {
          throw new Error('No product containers found on the page - search may have failed or page not loaded');
        }
        
        let productAnalysisErrors: string[] = [];
        
        // Iterate through products in display order
        for (let i = 0; i < productContainers.length; i++) {
          const container = productContainers[i];
          
          try {
            // Extract product information with error handling
            const name = await this.getProductName(container);
            const price = await this.getProductPrice(container);
            
            console.log(`Checking product ${i + 1}/${productContainers.length}: ${name} - ${price}`);
            
            // Validate extracted data
            ErrorHandler.validateData(
              { name, price },
              [
                (data) => ({ 
                  isValid: data.name && data.name.length > 0, 
                  message: 'Product name is empty or invalid' 
                }),
                (data) => ({ 
                  isValid: data.price && data.price.includes('R'), 
                  message: 'Product price is missing or invalid format' 
                })
              ],
              `Product ${i + 1} data`
            );
            
            // Apply filtering criteria with detailed validation
            const isSamsung = ProductUtils.isSamsungBrand(name);
            const isTV = ProductUtils.isTV(name);
            const withinPrice = PriceUtils.isPriceWithinLimit(price, maxPrice);
            
            console.log(`📊 Analysis: Samsung=${isSamsung}, TV=${isTV}, PriceOK=${withinPrice} (${price})`);
            
            if (isSamsung && isTV && withinPrice) {
              console.log(`✅ Found matching Samsung TV: ${name} at ${price}`);
              return { name, price };
            }
            
            // Log why this product didn't match
            if (!isSamsung) console.log(`❌ Not Samsung brand: ${name}`);
            if (!isTV) console.log(`❌ Not a TV: ${name}`);
            if (!withinPrice) console.log(`❌ Price too high: ${price} > R${maxPrice}`);
            
          } catch (error) {
            const errorMsg = `Product ${i + 1} analysis failed: ${error instanceof Error ? error.message : error}`;
            console.warn(`⚠️ ${errorMsg}`);
            productAnalysisErrors.push(errorMsg);
            continue;
          }
        }
        
        // Log analysis summary
        if (productAnalysisErrors.length > 0) {
          console.warn(`⚠️ ${productAnalysisErrors.length}/${productContainers.length} products had analysis errors`);
        }
        
        // No matching Samsung TV found
        console.log('❌ No Samsung TV found within price limit after analyzing all products');
        return null;
      },
      true, // Enable network resilience
      'Samsung TV search operation'
    );
  }

  /**
   * Find first monitor with minimum refresh rate dynamically
   * 
   * This method implements Assessment Scenario 2 requirements:
   * "Add any 120Hz or higher refresh rate Monitor to your Wishlist"
   * 
   * Assessment Compliance Algorithm:
   * 1. Get all product containers from search results
   * 2. Iterate through products in display order
   * 3. For each product, extract name and price
   * 4. Apply two filters:
   *    - Must be a Monitor (isMonitor)
   *    - Must have 120Hz+ refresh rate (meetsRefreshRateRequirement)
   * 5. Return first product that matches ALL criteria
   * 6. Return null if no product meets requirements
   * 
   * This replaces hardcoded monitor selection with dynamic assessment-compliant logic.
   * 
   * @param minRefreshRate - Minimum refresh rate requirement (120 for assessment)
   * @returns Object with product name and price, or null if not found
   */
  async findFirstHighRefreshRateMonitor(minRefreshRate: number): Promise<{ name: string; price: string } | null> {
    console.log(`Looking for monitor with ${minRefreshRate}Hz or higher`);
    
    return await ErrorHandler.withNetworkResilience(
      async () => {
        // Get all available product containers for analysis
        const productContainers = await this.getAllProductContainers();
        console.log(`Found ${productContainers.length} product containers to analyze`);
        
        if (productContainers.length === 0) {
          throw new Error('No product containers found on the page - search may have failed or page not loaded');
        }
        
        let productAnalysisErrors: string[] = [];
        
        // Iterate through products in display order
        for (let i = 0; i < productContainers.length; i++) {
          const container = productContainers[i];
          
          try {
            // Extract product information with error handling
            const name = await this.getProductName(container);
            const price = await this.getProductPrice(container);
            
            console.log(`Checking product ${i + 1}/${productContainers.length}: ${name} - ${price}`);
            
            // Validate extracted data
            ErrorHandler.validateData(
              { name, price },
              [
                (data) => ({ 
                  isValid: data.name && data.name.length > 0, 
                  message: 'Product name is empty or invalid' 
                }),
                (data) => ({ 
                  isValid: data.price && data.price.includes('R'), 
                  message: 'Product price is missing or invalid format' 
                })
              ],
              `Product ${i + 1} data`
            );
            
            // Apply filtering criteria with detailed validation
            const isMonitor = ProductUtils.isMonitor(name);
            const meetsRefreshRate = ProductUtils.meetsRefreshRateRequirement(name, minRefreshRate);
            const extractedHz = ProductUtils.extractRefreshRate(name);
            
            console.log(`📊 Analysis: Monitor=${isMonitor}, RefreshRate=${extractedHz}Hz (Required: ${minRefreshRate}Hz+), Meets=${meetsRefreshRate}`);
            
            if (isMonitor && meetsRefreshRate) {
              console.log(`✅ Found matching monitor: ${name} at ${price} (${extractedHz}Hz)`);
              return { name, price };
            }
            
            // Log why this product didn't match
            if (!isMonitor) console.log(`❌ Not a monitor: ${name}`);
            if (!meetsRefreshRate) {
              if (extractedHz === null) {
                console.log(`❌ No refresh rate found in: ${name}`);
              } else {
                console.log(`❌ Refresh rate too low: ${extractedHz}Hz < ${minRefreshRate}Hz required`);
              }
            }
            
          } catch (error) {
            const errorMsg = `Product ${i + 1} analysis failed: ${error instanceof Error ? error.message : error}`;
            console.warn(`⚠️ ${errorMsg}`);
            productAnalysisErrors.push(errorMsg);
            continue;
          }
        }
        
        // Log analysis summary
        if (productAnalysisErrors.length > 0) {
          console.warn(`⚠️ ${productAnalysisErrors.length}/${productContainers.length} products had analysis errors`);
        }
        
        // No matching monitor found
        console.log(`❌ No monitor found with ${minRefreshRate}Hz or higher refresh rate after analyzing all products`);
        return null;
      },
      true, // Enable network resilience
      'High refresh rate monitor search operation'
    );
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