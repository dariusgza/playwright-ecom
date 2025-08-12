/**
 * Utility functions for product analysis and selection
 */
export class ProductUtils {
  /**
   * Check if product description contains refresh rate information
   * @param productText - Product name or description text
   * @returns Refresh rate in Hz if found, null otherwise
   */
  static extractRefreshRate(productText: string): number | null {
    if (!productText) return null;
    
    // Look for patterns like "120Hz", "144Hz", "165Hz", etc.
    const hzMatch = productText.match(/(\d+)\s*[Hh][Zz]/);
    if (hzMatch) {
      return parseInt(hzMatch[1]);
    }
    
    // Look for patterns like "120 Hz", "144 Hz", etc.
    const hzSpaceMatch = productText.match(/(\d+)\s+[Hh][Zz]/);
    if (hzSpaceMatch) {
      return parseInt(hzSpaceMatch[1]);
    }
    
    return null;
  }

  /**
   * Check if refresh rate meets minimum requirement
   * @param productText - Product name or description
   * @param minRefreshRate - Minimum required refresh rate
   * @returns true if product meets or exceeds refresh rate requirement
   */
  static meetsRefreshRateRequirement(productText: string, minRefreshRate: number): boolean {
    const refreshRate = this.extractRefreshRate(productText);
    return refreshRate !== null && refreshRate >= minRefreshRate;
  }

  /**
   * Check if product is a Samsung brand
   * @param productText - Product name or description
   * @returns true if product is Samsung brand
   */
  static isSamsungBrand(productText: string): boolean {
    return productText.toLowerCase().includes('samsung');
  }

  /**
   * Check if product is a TV
   * @param productText - Product name or description
   * @returns true if product appears to be a TV
   */
  static isTV(productText: string): boolean {
    const tvKeywords = ['tv', 'television', 'smart tv', 'led tv', 'qled', 'oled'];
    const lowerText = productText.toLowerCase();
    return tvKeywords.some(keyword => lowerText.includes(keyword));
  }

  /**
   * Check if product is a monitor
   * @param productText - Product name or description
   * @returns true if product appears to be a monitor
   */
  static isMonitor(productText: string): boolean {
    const monitorKeywords = ['monitor', 'display', 'screen', 'lcd', 'gaming monitor'];
    const lowerText = productText.toLowerCase();
    return monitorKeywords.some(keyword => lowerText.includes(keyword));
  }
}