import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

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
   * Get all product articles on the page
   */
  getProductArticles(): Locator {
    return this.page.locator('article[data-ref="product-item"]');
  }

  /**
   * Get product name from a product article
   * @param productArticle - The product article element
   */
  async getProductName(productArticle: Locator): Promise<string> {
    const nameElement = productArticle.locator('[data-ref="product-title"]');
    return await nameElement.textContent() || '';
  }

  /**
   * Get product price from a product article
   * @param productArticle - The product article element
   */
  async getProductPrice(productArticle: Locator): Promise<string> {
    const priceElement = productArticle.locator('[data-ref="price"]');
    return await priceElement.textContent() || '';
  }
}