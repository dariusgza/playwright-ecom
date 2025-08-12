/**
 * Utility functions for price parsing and comparison
 * 
 * This class handles South African Rand (ZAR) price parsing as required by the assessment.
 * Takealot.com displays prices in various formats that need to be normalized for comparison.
 * 
 * Assessment Requirement: Dynamic product selection requires comparing prices against
 * the R15,000 limit specified in Scenario 1.
 */
export class PriceUtils {
  /**
   * Parse South African Rand price string to numeric value
   * 
   * Handles multiple price formats found on Takealot.com:
   * - Standard format: "R 10,499" (with space and comma)
   * - Compact format: "R10,499" (no space)
   * - Simple format: "R10499" (no comma)
   * - Range format: "From R 2,749" (extracts the numeric part)
   * 
   * @param priceText - Price string like "R 10,499" or "R10,499" or "R10499"
   * @returns Numeric price value or null if parsing fails
   */
  static parsePrice(priceText: string): number | null {
    // Input validation - return null for empty/undefined strings
    if (!priceText) return null;
    
    // Multi-step cleaning process to handle various Takealot price formats
    // Step 1: Remove 'R' currency symbol and any following spaces
    // Step 2: Remove all commas and remaining spaces for clean numeric string
    // Step 3: Trim any leading/trailing whitespace
    const cleanPrice = priceText
      .replace(/R\s*/g, '') // Remove R and any following spaces
      .replace(/[,\s]/g, '') // Remove commas and spaces
      .replace(/[^\d.]/g, '') // Remove any non-numeric characters except decimal points
      .trim();
    
    // Convert cleaned string to numeric value
    const numericValue = parseFloat(cleanPrice);
    
    // Return null if parsing resulted in NaN (invalid price format)
    return isNaN(numericValue) ? null : numericValue;
  }

  /**
   * Compare if price is less than or equal to maximum price
   * 
   * This is the core method for Assessment Scenario 1 compliance:
   * "Add the first item in the filtered results that's price is not more than R15 000 to the cart"
   * 
   * Business Logic:
   * 1. Parse the price string to extract numeric value
   * 2. Validate parsing was successful (not null)
   * 3. Compare against maximum price threshold
   * 4. Return boolean result for filtering logic
   * 
   * @param priceText - Price string to compare (e.g., "R 10,499")
   * @param maxPrice - Maximum allowed price (e.g., 15000 for assessment)
   * @returns true if price is within limit, false otherwise
   */
  static isPriceWithinLimit(priceText: string, maxPrice: number): boolean {
    // Parse price string to numeric value
    const price = this.parsePrice(priceText);
    
    // Return true only if:
    // 1. Price parsing was successful (price !== null)
    // 2. Price is less than or equal to the maximum allowed
    return price !== null && price <= maxPrice;
  }

  /**
   * Format price for display in South African Rand format
   * 
   * Converts numeric price back to standardized display format
   * using South African locale formatting rules.
   * 
   * @param price - Numeric price value
   * @returns Formatted price string like "R 10,499"
   */
  static formatPrice(price: number): string {
    // Use South African locale to format with proper thousands separators
    return `R ${price.toLocaleString('en-ZA')}`;
  }
}