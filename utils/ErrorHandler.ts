/**
 * Centralized error handling utility for robust test execution
 * 
 * Provides standardized error handling patterns for common automation scenarios:
 * - Network connectivity issues
 * - Element targeting failures
 * - Data parsing errors
 * - Browser context problems
 * - Graceful degradation strategies
 */
export class ErrorHandler {
  /**
   * Retry mechanism with exponential backoff for unreliable operations
   * 
   * @param operation - The async operation to retry
   * @param maxRetries - Maximum number of retry attempts (default: 3)
   * @param baseDelay - Base delay between retries in milliseconds (default: 1000)
   * @param description - Description of the operation for logging
   * @returns Promise resolving to operation result or throwing after max retries
   */
  static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
    description: string = 'operation'
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        if (attempt > 1) {
          console.log(`✅ ${description} succeeded on attempt ${attempt}`);
        }
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          console.error(`❌ ${description} failed after ${maxRetries} attempts: ${lastError.message}`);
          break;
        }
        
        // Exponential backoff: 1s, 2s, 4s, etc.
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.warn(`⚠️ ${description} failed on attempt ${attempt}/${maxRetries}, retrying in ${delay}ms: ${lastError.message}`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  /**
   * Safe element interaction with timeout and error recovery
   * 
   * @param operation - The element operation to perform safely
   * @param fallback - Optional fallback operation if primary fails
   * @param timeout - Operation timeout in milliseconds (default: 10000)
   * @param description - Description for logging
   * @returns Promise resolving to operation result or fallback result
   */
  static async safeElementOperation<T>(
    operation: () => Promise<T>,
    fallback?: () => Promise<T>,
    timeout: number = 10000,
    description: string = 'element operation'
  ): Promise<T> {
    try {
      // Set up timeout wrapper
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Operation timeout after ${timeout}ms`)), timeout);
      });
      
      const result = await Promise.race([operation(), timeoutPromise]);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`⚠️ Primary ${description} failed: ${errorMessage}`);
      
      if (fallback) {
        try {
          console.log(`🔄 Attempting fallback for ${description}`);
          return await fallback();
        } catch (fallbackError) {
          const fallbackMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
          console.error(`❌ Fallback also failed for ${description}: ${fallbackMessage}`);
          throw new Error(`Both primary and fallback operations failed. Primary: ${errorMessage}, Fallback: ${fallbackMessage}`);
        }
      }
      
      throw error;
    }
  }

  /**
   * Validate data with detailed error messaging
   * 
   * @param data - Data to validate
   * @param validationRules - Array of validation functions
   * @param dataType - Type of data being validated for error messages
   * @throws Error with detailed validation failure information
   */
  static validateData(
    data: any,
    validationRules: Array<(data: any) => { isValid: boolean; message: string }>,
    dataType: string = 'data'
  ): void {
    const failures: string[] = [];
    
    for (const rule of validationRules) {
      const result = rule(data);
      if (!result.isValid) {
        failures.push(result.message);
      }
    }
    
    if (failures.length > 0) {
      throw new Error(`${dataType} validation failed: ${failures.join(', ')}`);
    }
  }

  /**
   * Graceful degradation wrapper for optional functionality
   * 
   * @param operation - The operation to attempt
   * @param defaultValue - Default value to return if operation fails
   * @param description - Description for logging
   * @returns Operation result or default value
   */
  static async withGracefulDegradation<T>(
    operation: () => Promise<T>,
    defaultValue: T,
    description: string = 'operation'
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`⚠️ ${description} failed gracefully, using default value: ${errorMessage}`);
      return defaultValue;
    }
  }

  /**
   * Network-aware operation with connectivity checks
   * 
   * @param operation - The network-dependent operation
   * @param retryOnNetworkError - Whether to retry on network failures
   * @param description - Description for logging
   * @returns Promise resolving to operation result
   */
  static async withNetworkResilience<T>(
    operation: () => Promise<T>,
    retryOnNetworkError: boolean = true,
    description: string = 'network operation'
  ): Promise<T> {
    const networkErrorPatterns = [
      /net::/i,
      /timeout/i,
      /connection/i,
      /network/i,
      /dns/i,
      /unreachable/i
    ];
    
    const isNetworkError = (error: Error): boolean => {
      return networkErrorPatterns.some(pattern => pattern.test(error.message));
    };
    
    if (retryOnNetworkError) {
      return this.retryWithBackoff(
        operation,
        3, // Max retries for network issues
        2000, // 2 second base delay for network recovery
        `${description} (network resilient)`
      );
    } else {
      try {
        return await operation();
      } catch (error) {
        if (error instanceof Error && isNetworkError(error)) {
          throw new Error(`Network error during ${description}: ${error.message}. Consider enabling retry for network operations.`);
        }
        throw error;
      }
    }
  }
}