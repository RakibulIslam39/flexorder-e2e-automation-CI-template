# FlexOrder Plugin CI/CD Setup

This document provides comprehensive setup instructions for the FlexOrder WordPress plugin CI/CD pipeline using GitHub Actions.

## Recent CI Fixes (Latest Update)

### Issues Fixed:
1. **PHPCS Errors**: Fixed WordPress coding standards configuration to handle projects without actual PHP plugin files
2. **WordPress Setup Error**: Fixed database host configuration in Koodimonni template setup
3. **Missing Dependencies**: Added WP-CLI, jq, and WooCommerce CLI extension installations

### Changes Made:
- Updated PHPCS script to exclude test files and only check actual plugin files
- Fixed sed command to properly use environment variables for database host
- Added conditional PHPCS execution when no PHP files are present
- Added WP-CLI and jq installation for JSON parsing
- Added WooCommerce CLI extension for API commands

## Prerequisites

### GitHub Secrets Required

Add the following secrets to your GitHub repository:

#### WooCommerce API Credentials
- `WOOCOMMERCE_CONSUMER_KEY` - WooCommerce REST API Consumer Key
- `WOOCOMMERCE_CONSUMER_SECRET` - WooCommerce REST API Consumer Secret

#### Google Sheets API Credentials
- `GOOGLE_SHEET_ID` - Google Sheets document ID
- `GOOGLE_SHEET_URL` - Google Sheets document URL
- `GOOGLE_SHEET_SCOPES` - Google Sheets API scopes (default: https://www.googleapis.com/auth/spreadsheets)
- `SHEET_NAME` - Name of the sheet to use (default: Sheet1)
- `SHEET_RANGE` - Range to read/write (default: A1:D50)
- `GOOGLE_ACCOUNT_EMAIL` - Google account email for authentication
- `GOOGLE_ACCOUNT_PASSWORD` - Google account password for authentication
- `SERVICE_ACCOUNT_UPLOAD_FILE` - Path to service account JSON file

#### Apps Script (Optional)
- `APPS_SCRIPT_DEPLOYMENT_ID` - Google Apps Script deployment ID
- `APPS_SCRIPT_PROJECT_ID` - Google Apps Script project ID

## Workflow Structure

The CI pipeline consists of the following jobs:

### 1. Lint and Quality (`lint-and-quality`)
- Runs ESLint for JavaScript/TypeScript code quality
- Runs PHP CodeSniffer for PHP code quality
- Ensures code follows WordPress coding standards

### 2. Security Scan (`security-scan`)
- Runs Trivy vulnerability scanner
- Uploads results to GitHub Security tab
- Identifies potential security issues

### 3. Setup WordPress (`setup-wordpress`)
- Sets up WordPress test environment using Koodimonni template
- Installs and configures WooCommerce
- Generates WooCommerce REST API credentials
- Creates test data (products and orders)
- Builds FlexOrder plugin packages
- Installs and activates the plugin
- Runs E2E tests with Playwright

### 4. PHP Unit Tests (`php-unit-tests`)
- Runs PHPUnit tests for plugin functionality
- Generates code coverage reports
- Uploads coverage to Codecov

### 5. Build and Deploy (`build-and-deploy`)
- Creates production-ready plugin packages
- Uploads build artifacts
- Creates GitHub releases (on tags)

## Local Development Setup

### 1. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install PHP dependencies
composer install

# Install Playwright browsers
npm run install:browsers
```

### 2. Environment Configuration

Create `tests/utilities/.env` file with your credentials:

```env
# WordPress Configuration
SITE_URL=http://localhost:8000
URL=http://localhost:8000
USER_NAME=admin
PASSWORD=password
ADMIN_PANEL_URL=http://localhost:8000/wp-admin

# WooCommerce API
WOOCOMMERCE_CONSUMER_KEY=your_consumer_key
WOOCOMMERCE_CONSUMER_SECRET=your_consumer_secret

# Google Sheets API
GOOGLE_SHEET_ID=your_sheet_id
GOOGLE_SHEET_URL=https://docs.google.com/spreadsheets/d/your_sheet_id
GOOGLE_SHEET_SCOPES=https://www.googleapis.com/auth/spreadsheets
SHEET_NAME=Sheet1
SHEET_RANGE=A1:D50
GOOGLE_ACCOUNT_EMAIL=your_email@gmail.com
GOOGLE_ACCOUNT_PASSWORD=your_password
SERVICE_ACCOUNT_UPLOAD_FILE=tests/utilities/upload_key.json

# Apps Script (Optional)
APPS_SCRIPT_DEPLOYMENT_ID=your_deployment_id
APPS_SCRIPT_PROJECT_ID=your_project_id
```

### 3. WordPress Test Environment

For local testing, you can set up WordPress using the Koodimonni template:

```bash
# Clone the WordPress test template
git clone https://github.com/Koodimonni/wordpress-test-template wp-tests

# Install WordPress test environment
bash wp-tests/bin/install-wp-tests.sh test root '' localhost latest

# Install WooCommerce
cd /tmp/wordpress
wp plugin install woocommerce --activate --allow-root

# Generate API credentials
wp wc api_key create --user=1 --description="Local Test API Key" --permissions=read_write --allow-root
```

### 4. Running Tests

```bash
# Run all tests
npm test

# Run specific test types
npm run test:api      # API tests only
npm run test:smoke    # Smoke tests only
npm run test:ui       # UI tests only

# Run tests in headed mode
npm run test:headed

# Run tests with debug
npm run test:debug

# Run tests with UI
npm run test:ui
```

## Test Structure

### API Tests (`@api`)
- WooCommerce API integration tests
- Google Sheets API integration tests
- Order creation and synchronization tests
- Bulk operations tests

### UI Tests (`@ui`)
- WordPress admin interface tests
- Plugin activation and configuration tests
- WooCommerce settings verification

### Smoke Tests (`@smoke`)
- Basic connectivity tests
- Essential functionality tests
- Quick validation tests

## Troubleshooting

### Common Issues

1. **WooCommerce API Connection Failed**
   - Verify consumer key and secret are correct
   - Ensure WooCommerce is properly installed and configured
   - Check if REST API is enabled

2. **Google Sheets API Connection Failed**
   - Verify service account credentials
   - Check sheet permissions
   - Ensure Google Sheets API is enabled

3. **WordPress Installation Issues**
   - Check MySQL connection
   - Verify PHP extensions are installed
   - Ensure proper file permissions

4. **Playwright Tests Failing**
   - Check if WordPress server is running
   - Verify admin credentials
   - Check browser installation

### Debug Mode

Run tests in debug mode to get more detailed information:

```bash
npm run test:debug
```

### Logs and Reports

- Test results: `test-results/`
- Playwright reports: `playwright-report/`
- Coverage reports: `coverage/`
- Build artifacts: `dist/`

## Performance Optimization

### Parallel Execution
- Tests run in parallel where possible
- Use `@smoke` tag for quick validation
- Separate API and UI tests for better parallelization

### Caching
- Node modules are cached in CI
- Browser binaries are cached
- Composer dependencies are cached

### Resource Management
- Clean up test data after each test
- Use proper timeouts for API calls
- Implement retry logic for flaky tests

## Security Considerations

1. **Credential Management**
   - All sensitive data is stored in GitHub Secrets
   - No hardcoded credentials in code
   - Environment-specific configuration

2. **Vulnerability Scanning**
   - Regular security scans with Trivy
   - Dependency vulnerability checks
   - Code quality enforcement

3. **Access Control**
   - Minimal required permissions for API access
   - Secure handling of service account keys
   - Proper cleanup of test data

## Monitoring and Alerts

### Success Metrics
- All tests passing
- Code coverage above threshold
- No security vulnerabilities
- Build time within limits

### Failure Alerts
- Test failures trigger notifications
- Security scan failures are reported
- Build failures are logged

## Contributing

### Code Quality
- Follow ESLint rules
- Adhere to WordPress coding standards
- Write comprehensive tests

### Testing Guidelines
- Add tests for new features
- Update tests when changing functionality
- Use appropriate test tags (@api, @ui, @smoke)

### Documentation
- Update this guide when changing setup
- Document new environment variables
- Keep troubleshooting section current

