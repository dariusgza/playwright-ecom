import { Page, Locator } from '@playwright/test';

/**
 * Base page class providing common functionality for all page objects
 */
export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   * @param url - The URL to navigate to
   */
  async goto(url: string): Promise<void> {
    await this.page.goto(url);
  }

  /**
   * Wait for page to load by checking for a specific element
   * @param locator - The locator to wait for
   */
  async waitForLoad(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
  }

  /**
   * Click on an element and wait for it to be actionable, with overlay handling
   * @param locator - The element to click
   */
  async click(locator: Locator): Promise<void> {
    // First, try to dismiss any overlays that might block the click
    await this.dismissOverlays();
    
    try {
      // Try normal click first
      await locator.click({ timeout: 10000 });
    } catch (error) {
      console.log(`Normal click failed, trying force click: ${error instanceof Error ? error.message : error}`);
      
      // If normal click fails due to overlay, try force click
      try {
        await locator.click({ force: true, timeout: 5000 });
        console.log('✅ Force click succeeded');
      } catch (forceError) {
        console.log(`Force click also failed: ${forceError instanceof Error ? forceError.message : forceError}`);
        
        // Last resort: try clicking with script
        try {
          await locator.evaluate((element: any) => element.click());
          console.log('✅ Script click succeeded');
        } catch (scriptError) {
          console.log(`Script click failed: ${scriptError instanceof Error ? scriptError.message : scriptError}`);
          throw error; // Re-throw original error
        }
      }
    }
  }

  /**
   * Dismiss common overlays that might block interactions
   */
  private async dismissOverlays(): Promise<void> {
    const overlaySelectors = [
      '.ab-page-blocker',
      '.page-blocker', 
      '.overlay-blocker',
      '.cookies-banner-module_cookie-banner_hsodu',
      '[role="dialog"]',
      '.modal'
    ];
    
    for (const selector of overlaySelectors) {
      try {
        const overlay = this.page.locator(selector).first();
        if (await overlay.isVisible({ timeout: 500 })) {
          // Try to find a close button in the overlay
          const closeSelectors = [
            'button:has-text("Close")',
            'button:has-text("×")',
            'button:has-text("NOT NOW")',
            '[aria-label*="Close"]',
            '.close-button'
          ];
          
          for (const closeSelector of closeSelectors) {
            try {
              const closeBtn = overlay.locator(closeSelector).first();
              if (await closeBtn.isVisible({ timeout: 500 })) {
                await closeBtn.click({ force: true });
                console.log(`✅ Dismissed overlay with selector: ${closeSelector}`);
                await this.page.waitForTimeout(500);
                break;
              }
            } catch {
              // Continue to next close selector
            }
          }
        }
      } catch {
        // Continue to next overlay selector
      }
    }
  }

  /**
   * Fill text into an input field
   * @param locator - The input element
   * @param text - The text to fill
   */
  async fill(locator: Locator, text: string): Promise<void> {
    await locator.fill(text);
  }
}