# FlexOrder Plugin CI/CD Workflow

A comprehensive CI/CD pipeline for the FlexOrder WordPress plugin with automated testing, security scanning, and deployment capabilities.

## 🚀 Features

- **Automated Testing**: E2E tests with Playwright, PHP unit tests with PHPUnit
- **Code Quality**: ESLint for JavaScript/TypeScript, PHP CodeSniffer for PHP
- **Security Scanning**: Trivy vulnerability scanner integration
- **WordPress Integration**: Koodimonni WordPress test template integration
- **WooCommerce Support**: Automated WooCommerce setup and API credential generation
- **Google Sheets Integration**: API testing for Google Sheets functionality
- **Build Automation**: Automated plugin packaging (Free and Pro versions)
- **Release Management**: GitHub releases with automated artifact uploads

## 📋 Prerequisites

### Required GitHub Secrets

Add these secrets to your GitHub repository:

#### WooCommerce API Credentials
- `WOOCOMMERCE_CONSUMER_KEY` - WooCommerce REST API Consumer Key
- `WOOCOMMERCE_CONSUMER_SECRET` - WooCommerce REST API Consumer Secret

#### Google Sheets API Credentials
- `GOOGLE_SHEET_ID` - Google Sheets document ID
- `GOOGLE_SHEET_URL` - Google Sheets document URL
- `GOOGLE_SHEET_SCOPES` - Google Sheets API scopes
- `SHEET_NAME` - Name of the sheet to use
- `SHEET_RANGE` - Range to read/write
- `GOOGLE_ACCOUNT_EMAIL` - Google account email
- `GOOGLE_ACCOUNT_PASSWORD` - Google account password
- `SERVICE_ACCOUNT_UPLOAD_FILE` - Path to service account JSON file

#### Apps Script (Optional)
- `APPS_SCRIPT_DEPLOYMENT_ID` - Google Apps Script deployment ID
- `APPS_SCRIPT_PROJECT_ID` - Google Apps Script project ID

## 🏗️ Workflow Structure

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
- Creates test data (50 products and orders)
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

## 🛠️ Local Development Setup

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

**Note**: For Google Cloud Service Account credentials, copy `tests/utilities/upload_key.json.example` to `tests/utilities/upload_key.json` and fill in your actual credentials.

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

### 3. Running Tests

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

## 📁 Project Structure

```
flexorder-e2e-automation-CI-template/
├── .github/workflows/          # GitHub Actions workflows
├── config/                     # Configuration files
│   ├── credentials.js         # Centralized credential management
│   ├── environment.js         # Environment configuration
│   └── flaky-tests-reporter.ts # Custom test reporter
├── tests/                      # Test files
│   ├── pages/                 # Page Object Models
│   ├── testcase/              # Test specifications
│   ├── utilities/             # Test utilities
│   ├── global-setup.ts        # Global test setup
│   └── global-teardown.ts     # Global test teardown
├── test-utils/                 # API utilities
│   ├── woocommerce-api.js     # WooCommerce API client
│   └── google-sheets-api.js   # Google Sheets API client
├── composer.json              # PHP dependencies
├── package.json               # Node.js dependencies
├── playwright.config.ts       # Playwright configuration
├── phpunit.xml               # PHPUnit configuration
└── README.md                 # This file
```

## 🔧 Configuration

### Playwright Configuration
- Supports multiple browsers (Chromium, Firefox, WebKit)
- Parallel test execution
- Retry logic for flaky tests
- Video recording on failure
- Screenshot capture on failure

### PHPUnit Configuration
- WordPress test environment integration
- Code coverage reporting
- Custom test suites
- Bootstrap file for plugin loading

## 🚀 Deployment

### Automatic Deployment
The workflow automatically:
1. Builds plugin packages (Free and Pro versions)
2. Uploads build artifacts
3. Creates GitHub releases on tags
4. Generates release notes

### Manual Deployment
```bash
# Build plugin packages
npm run build

# Create release
git tag v1.0.0
git push origin v1.0.0
```

## 📊 Monitoring and Reports

### Test Reports
- HTML test reports in `playwright-report/`
- JUnit XML reports for CI integration
- Coverage reports in `coverage/`

### Security Reports
- Trivy vulnerability scan results
- GitHub Security tab integration
- Dependency vulnerability alerts

### Performance Metrics
- Test execution time tracking
- Coverage percentage monitoring
- Build artifact size tracking

## 🐛 Troubleshooting

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

## 🤝 Contributing

### Code Quality
- Follow ESLint rules
- Adhere to WordPress coding standards
- Write comprehensive tests

### Testing Guidelines
- Add tests for new features
- Update tests when changing functionality
- Use appropriate test tags (@api, @ui, @smoke)

### Documentation
- Update this README when changing setup
- Document new environment variables
- Keep troubleshooting section current

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Check the [CI_SETUP.md](CI_SETUP.md) for detailed setup instructions
- Review the troubleshooting section above

## 🔄 Version History

- **v2.0.0** - Complete CI/CD pipeline with WordPress integration
- **v1.0.0** - Initial E2E testing setup

---

**Ready to deploy your FlexOrder plugin with confidence! 🚀**

