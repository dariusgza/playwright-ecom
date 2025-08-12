import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for Takealot homepage functionality
 */
export class TakealotHomePage extends BasePage {
  private readonly searchBox: Locator;
  private readonly notNowButton: Locator;

  constructor(page: Page) {
    super(page);
    this.searchBox = page.getByRole('textbox', { name: 'Search for products, brands...' });
    this.notNowButton = page.getByRole('button', { name: 'NOT NOW' });
  }

  /**
   * Navigate to Takealot homepage
   */
  async navigate(): Promise<void> {
    await this.goto('https://www.takealot.com/');
  }

  /**
   * Dismiss the cookie/notification dialog if present
   */
  async dismissNotifications(): Promise<void> {
    try {
      await this.notNowButton.waitFor({ state: 'visible', timeout: 5000 });
      await this.click(this.notNowButton);
      // Wait a moment for any overlays to disappear
      await this.page.waitForTimeout(2000);
    } catch {
      // Notification dialog may not appear, continue
    }
  }

  /**
   * Search for a product
   * @param searchTerm - The product to search for
   */
  async searchForProduct(searchTerm: string): Promise<void> {
    // Wait for search box to be available and not blocked by overlays
    await this.searchBox.waitFor({ state: 'visible' });
    await this.click(this.searchBox);
    await this.fill(this.searchBox, searchTerm);
    await this.searchBox.press('Enter');
  }

  /**
   * Navigate to cart page
   */
  async goToCart(): Promise<void> {
    const cartLink = this.page.getByRole('link', { name: 'Go to Cart' });
    await this.click(cartLink);
  }

  /**
   * Navigate to wishlist page
   */
  async goToWishlist(): Promise<void> {
    const wishlistLink = this.page.getByRole('link', { name: 'wishlist' });
    await this.click(wishlistLink);
  }
}