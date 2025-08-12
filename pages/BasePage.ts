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
   * Click on an element and wait for it to be actionable
   * @param locator - The element to click
   */
  async click(locator: Locator): Promise<void> {
    await locator.click();
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