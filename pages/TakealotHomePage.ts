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
    // Wait for dynamic content to load
    await this.page.waitForTimeout(3000);
  }

  /**
   * Dismiss the cookie/notification dialog if present
   */
  readonly dismissSelectors = [
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

  async tryDismissNotification(selector: string): Promise<boolean> {
    try {
      const element = this.page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 })) {
        await this.click(element);
        console.log(`✅ Dismissed notification using selector: ${selector}`);
        await this.page.waitForTimeout(1000);
        return true;
      }
    } catch {
      // Continue to next selector
    }
    return false;
  }

  async tryDismissModal(): Promise<boolean> {
    try {
      const pageBlocker = this.page.locator('.ab-page-blocker, .page-blocker, .overlay-blocker').first();
      if (await pageBlocker.isVisible({ timeout: 1000 })) {
        console.log('⚠️ Page blocker detected, trying to dismiss parent modal');
        const modal = this.page.locator('[role="dialog"], .modal, .popup').first();
        if (await modal.isVisible({ timeout: 1000 })) {
          const closeButton = modal.locator('button:has-text("Close"), button:has-text("×"), [aria-label*="Close"]').first();
          if (await closeButton.isVisible({ timeout: 1000 })) {
            await this.click(closeButton);
            console.log('✅ Dismissed modal dialog');
            return true;
          }
        }
      }
    } catch {
      // Continue
    }
    return false;
  }

  async dismissNotifications(): Promise<void> {
    for (let attempt = 0; attempt < 3; attempt++) {
      console.log(`Dismissing notifications - attempt ${attempt + 1}`);
      
      for (const selector of this.dismissSelectors) {
        await this.tryDismissNotification(selector);
      }
      
      await this.tryDismissModal();
      await this.page.waitForTimeout(2000);
    }
    
    console.log('Finished dismissing notifications');
  }

  /**
   * Search for a product
   * @param searchTerm - The product to search for
   */
  async searchForProduct(searchTerm: string): Promise<void> {
    // Wait for search box to be available and not blocked by overlays
    await this.searchBox.waitFor({ state: 'visible', timeout: 10000 });
    await this.click(this.searchBox);
    await this.fill(this.searchBox, searchTerm);
    await this.searchBox.press('Enter');
    // Wait for search results to load
    await this.page.waitForTimeout(3000);
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