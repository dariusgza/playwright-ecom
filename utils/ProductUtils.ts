/**
 * Utility functions for product analysis and selection
 * 
 * This class implements the business logic for dynamic product selection
 * as required by the assessment scenarios. It analyzes product names and
 * descriptions to determine product characteristics without hardcoding
 * specific product names.
 * 
 * Assessment Requirements:
 * - Scenario 1: Identify Samsung brand TVs
 * - Scenario 2: Identify monitors with 120Hz+ refresh rates
 */
export class ProductUtils {
  /**
   * Extract refresh rate information from product text
   * 
   * This method implements the core logic for Assessment Scenario 2:
   * "Add any 120Hz or higher refresh rate Monitor to your Wishlist"
   * 
   * Algorithm:
   * 1. Search for common refresh rate patterns in product names
   * 2. Handle various formatting styles used by Takealot
   * 3. Extract numeric value and return for comparison
   * 
   * Supported patterns:
   * - "120Hz" (no space)
   * - "120 Hz" (with space)
   * - "144hz" (lowercase)
   * - Mixed case variations
   * 
   * @param productText - Product name or description text
   * @returns Refresh rate in Hz if found, null otherwise
   */
  static extractRefreshRate(productText: string): number | null {
    // Input validation - handle empty/null strings
    if (!productText) return null;
    
    // Pattern 1: Look for "120Hz", "144Hz", "165Hz", etc. (no space)
    // Regex explanation: (\d+) captures digits, \s* matches optional spaces, [Hh][Zz] matches Hz in any case
    const hzMatch = productText.match(/(\d+)\s*[Hh][Zz]/);
    if (hzMatch) {
      // Convert captured group to integer (first parentheses group)
      return parseInt(hzMatch[1]);
    }
    
    // Pattern 2: Look for "120 Hz", "144 Hz", etc. (with space)
    // Regex explanation: (\d+) captures digits, \s+ matches one or more spaces, [Hh][Zz] matches Hz
    const hzSpaceMatch = productText.match(/(\d+)\s+[Hh][Zz]/);
    if (hzSpaceMatch) {
      return parseInt(hzSpaceMatch[1]);
    }
    
    // No refresh rate pattern found in product text
    return null;
  }

  /**
   * Check if refresh rate meets minimum requirement
   * 
   * This is the validation method for Assessment Scenario 2 compliance.
   * It combines refresh rate extraction with threshold comparison to determine
   * if a monitor meets the "120Hz or higher" requirement.
   * 
   * @param productText - Product name or description
   * @param minRefreshRate - Minimum required refresh rate (120 for assessment)
   * @returns true if product meets or exceeds refresh rate requirement
   */
  static meetsRefreshRateRequirement(productText: string, minRefreshRate: number): boolean {
    // Extract refresh rate from product text
    const refreshRate = this.extractRefreshRate(productText);
    
    // Return true only if:
    // 1. Refresh rate was successfully extracted (not null)
    // 2. Extracted rate meets or exceeds minimum requirement
    return refreshRate !== null && refreshRate >= minRefreshRate;
  }

  /**
   * Check if product is a Samsung brand
   * 
   * This method implements brand filtering for Assessment Scenario 1:
   * "Filter results by Brand Samsung"
   * 
   * Uses case-insensitive string matching to identify Samsung products
   * regardless of capitalization variations in product names.
   * 
   * @param productText - Product name or description
   * @returns true if product is Samsung brand
   */
  static isSamsungBrand(productText: string): boolean {
    // Case-insensitive brand detection to handle various capitalizations
    return productText.toLowerCase().includes('samsung');
  }

  /**
   * Check if product is a TV
   * 
   * This method implements product type filtering for Assessment Scenario 1.
   * It uses keyword matching to identify TV products from their names/descriptions.
   * 
   * TV Keywords Strategy:
   * - Covers common TV terminology on Takealot
   * - Includes technology types (LED, QLED, OLED)
   * - Handles both formal and informal naming
   * 
   * @param productText - Product name or description
   * @returns true if product appears to be a TV
   */
  static isTV(productText: string): boolean {
    // Comprehensive TV keyword list based on Takealot product naming patterns
    const tvKeywords = ['tv', 'television', 'smart tv', 'led tv', 'qled', 'oled'];
    
    // Convert to lowercase for case-insensitive matching
    const lowerText = productText.toLowerCase();
    
    // Return true if ANY TV keyword is found in the product text
    return tvKeywords.some(keyword => lowerText.includes(keyword));
  }

  /**
   * Check if product is a monitor
   * 
   * This method implements product type filtering for Assessment Scenario 2.
   * It identifies monitor products using keyword-based classification.
   * 
   * Monitor Keywords Strategy:
   * - Covers general monitor terminology
   * - Includes gaming-specific variants
   * - Handles technical display terms
   * 
   * @param productText - Product name or description
   * @returns true if product appears to be a monitor
   */
  static isMonitor(productText: string): boolean {
    // Monitor keyword list optimized for Takealot product catalog
    const monitorKeywords = ['monitor', 'display', 'screen', 'lcd', 'gaming monitor'];
    
    // Case-insensitive matching
    const lowerText = productText.toLowerCase();
    
    // Return true if ANY monitor keyword is found
    return monitorKeywords.some(keyword => lowerText.includes(keyword));
  }
}