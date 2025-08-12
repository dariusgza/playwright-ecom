# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an enterprise-grade Playwright end-to-end testing project for e-commerce automation on Takealot.com. The framework implements dynamic product selection algorithms, comprehensive error handling, and page object patterns to create maintainable, robust automation tests. It features intelligent product analysis capabilities that replace hardcoded approaches with smart selection logic.

## Architecture

### Page Object Model Structure
- **BasePage** (`pages/BasePage.ts`): Abstract base class with common page functionality
- **TakealotHomePage** (`pages/TakealotHomePage.ts`): Homepage navigation and search
- **SearchResultsPage** (`pages/SearchResultsPage.ts`): Product analysis and selection logic
- **CartPage** (`pages/CartPage.ts`): Shopping cart verification
- **WishlistPage** (`pages/WishlistPage.ts`): Wishlist functionality

### Utility Classes
- **PriceUtils** (`utils/PriceUtils.ts`): South African Rand price parsing and validation
- **ProductUtils** (`utils/ProductUtils.ts`): Brand detection, product classification, refresh rate analysis
- **ErrorHandler** (`utils/ErrorHandler.ts`): Retry mechanisms, fallback strategies, network resilience

## Common Commands

### Running Tests
- Run all tests: `npx playwright test`
- Run tests in headed mode: `npx playwright test --headed`
- Run dynamic selection tests: `npx playwright test tests/dynamic-selection-tests.spec.ts`
- Run original tests (fallback): `npx playwright test tests/ecom-scenario-tests.spec.ts`
- Run single scenario: `npx playwright test --grep "Samsung TV"`
- Show test report: `npx playwright show-report`

### Development
- Install dependencies: `npm ci`
- Install Playwright browsers: `npx playwright install --with-deps`
- Generate new test: `npx playwright codegen https://www.takealot.com/`

### Debugging
- Run tests in debug mode: `npx playwright test --debug`
- Debug specific test: `npx playwright test tests/dynamic-selection-tests.spec.ts --debug`
- Open trace viewer: `npx playwright show-trace`

## Test Structure

### Main Test Files
- **`tests/dynamic-selection-tests.spec.ts`**: Production test suite with intelligent product selection
  - Scenario 1: Samsung TV under R15,000 (dynamic cart functionality)
  - Scenario 2: 120Hz+ monitor (dynamic wishlist functionality)
  - Fallback test with graceful degradation
- **`tests/ecom-scenario-tests.spec.ts`**: Basic test suite for reference
- **`tests-examples/demo-todo-app.spec.ts`**: TodoMVC example (reference only)

### Key Features
- **Dynamic Product Selection**: Intelligent algorithms replace hardcoded product names
- **Price Analysis**: Parse ZAR currency formats and validate price limits
- **Error Resilience**: Comprehensive retry mechanisms and fallback strategies
- **Network Handling**: Graceful degradation for connectivity issues
- **Multi-selector Strategies**: Robust element targeting with multiple fallback selectors

## Testing Approaches

### Scenario 1: Samsung TV Cart Testing
```typescript
// Dynamic selection replaces hardcoded approach
const selectedProduct = await searchResultsPage.findFirstSamsungTVWithinPrice(15000);
await searchResultsPage.addProductToCart(selectedProduct.name);
```

### Scenario 2: High Refresh Rate Monitor Wishlist
```typescript
// Intelligent refresh rate analysis
const selectedMonitor = await searchResultsPage.findFirstHighRefreshRateMonitor(120);
await searchResultsPage.addProductToWishlist(selectedMonitor.name);
```

### Error Handling Patterns
```typescript
// Retry with exponential backoff
await ErrorHandler.retryWithBackoff(operation, 3, 2000, 'description');

// Safe operations with fallbacks
await ErrorHandler.safeElementOperation(primary, fallback, timeout, 'description');
```

## Configuration Details

### Playwright Config (`playwright.config.ts`)
- Test directory: `./tests`
- Parallel execution: `fullyParallel: true`
- Browser coverage: Chromium, Firefox, WebKit
- Reporting: HTML with trace collection on retry
- CI optimization: 2 retries, single worker

### GitHub Actions
- Automated testing on push/PR to main
- Artifact retention: 30 days
- Environment: Ubuntu LTS with Node.js

## Advanced Features

### Dynamic Product Analysis
- **Brand Detection**: Case-insensitive Samsung identification
- **Product Classification**: TV vs Monitor distinction
- **Refresh Rate Extraction**: Regex patterns for Hz detection
- **Price Parsing**: Multiple ZAR format support (R 10,499, From R 2,749)

### Selector Strategies
```typescript
// Multiple fallback selectors for reliability
const productSelectors = [
  'article[data-ref="product-item"]',     // Most specific
  'article',                             // Semantic HTML
  '[data-ref="product-item"]',           // Data attributes
  '.product-item, .product-card'         // CSS classes
];
```

### Network Resilience
- Connection timeout handling
- DNS resolution retry
- Exponential backoff for network errors
- Graceful degradation patterns

## Development Guidelines

### Adding New Tests
1. Extend `BasePage` for new page objects
2. Use `ErrorHandler` utilities for robust operations
3. Implement multiple selector strategies
4. Add comprehensive logging for debugging

### Error Handling Standards
- Always provide fallback mechanisms
- Use descriptive error messages
- Implement timeout protection
- Log retry attempts and failures

### Product Selection Logic
- Avoid hardcoded product names
- Use utility classes for analysis
- Implement comprehensive validation
- Handle edge cases gracefully