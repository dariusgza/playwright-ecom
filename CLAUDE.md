# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Playwright end-to-end testing project focused on e-commerce website automation. The project tests functionality on Takealot.com, including cart operations and wishlist features. It includes both custom e-commerce tests and example Playwright TodoMVC tests for reference.

## Common Commands

### Running Tests
- Run all tests: `npx playwright test`
- Run tests in headed mode: `npx playwright test --headed`
- Run specific test file: `npx playwright test tests/ecom-scenario-tests.spec.ts`
- Run a single test: `npx playwright test --grep "cart functionality"`
- Show test report: `npx playwright show-report`

### Development
- Install dependencies: `npm ci`
- Install Playwright browsers: `npx playwright install --with-deps`
- Generate new test: `npx playwright codegen https://www.takealot.com/`

### Debugging
- Run tests in debug mode: `npx playwright test --debug`
- Run specific test in debug mode: `npx playwright test tests/test-1.spec.ts --debug`
- Open trace viewer: `npx playwright show-trace`

## Test Structure

### Main Test Files
- `tests/ecom-scenario-tests.spec.ts`: Basic e-commerce test with beforeEach hook for Takealot.com
- `tests/test-1.spec.ts`: Comprehensive cart and wishlist functionality tests
- `tests-examples/demo-todo-app.spec.ts`: Complete TodoMVC example test suite (reference only)

### Test Patterns
- Tests use page object model patterns with locators
- Common setup uses `test.beforeEach()` for navigation to base URLs
- Tests include verification of elements visibility, text content, and counts
- Extensive use of Playwright's auto-waiting capabilities

### Key Testing Approaches
- **Cart Testing**: Search for products → Add to cart → Verify cart contents and pricing
- **Wishlist Testing**: Search for products → Add to wishlist → Verify wishlist contents
- **Element Verification**: Uses combinations of `toBeVisible()`, `toContainText()`, `toHaveCount()`

## Configuration Details

### Playwright Config (`playwright.config.ts`)
- Test directory: `./tests`
- Runs tests in parallel by default (`fullyParallel: true`)
- Configured for Chromium, Firefox, and WebKit browsers
- HTML reporter enabled
- Trace collection on first retry for debugging
- CI-specific settings: 2 retries, single worker

### CI/CD
- GitHub Actions workflow configured in `.github/workflows/playwright.yml`
- Runs on push/PR to main/master branches
- Uploads test reports as artifacts with 30-day retention
- Uses Ubuntu latest with Node.js LTS

## Development Notes

### Target Application
- Primary testing target: https://www.takealot.com/
- Tests handle cookie acceptance dialogs ("NOT NOW" button)
- Search functionality tested with specific product queries ("65 tv", "120HZ Monitor")
- Tests interact with specific product brands (Samsung, MSI)

### Locator Strategies
- Extensive use of `getByRole()` for accessibility-based selection
- `getByLabel()` for form controls and buttons
- `filter()` and `hasText()` for refined element selection
- Test data IDs used in TodoMVC example (`getByTestId()`)

### Test Data Management
- Specific product names and prices hardcoded for Takealot tests
- TodoMVC uses constants array for test data consistency
- Price verification includes specific currency formatting (R 10,499)