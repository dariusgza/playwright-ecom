/**
 * Utility functions for price parsing and comparison
 */
export class PriceUtils {
  /**
   * Parse South African Rand price string to numeric value
   * @param priceText - Price string like "R 10,499" or "R10,499" or "R10499"
   * @returns Numeric price value or null if parsing fails
   */
  static parsePrice(priceText: string): number | null {
    if (!priceText) return null;
    
    // Remove 'R', spaces, and commas, then convert to number
    const cleanPrice = priceText
      .replace(/R\s*/g, '') // Remove R and any following spaces
      .replace(/[,\s]/g, '') // Remove commas and spaces
      .trim();
    
    const numericValue = parseFloat(cleanPrice);
    return isNaN(numericValue) ? null : numericValue;
  }

  /**
   * Compare if price is less than or equal to maximum price
   * @param priceText - Price string to compare
   * @param maxPrice - Maximum allowed price
   * @returns true if price is within limit, false otherwise
   */
  static isPriceWithinLimit(priceText: string, maxPrice: number): boolean {
    const price = this.parsePrice(priceText);
    return price !== null && price <= maxPrice;
  }

  /**
   * Format price for display
   * @param price - Numeric price value
   * @returns Formatted price string like "R 10,499"
   */
  static formatPrice(price: number): string {
    return `R ${price.toLocaleString('en-ZA')}`;
  }
}