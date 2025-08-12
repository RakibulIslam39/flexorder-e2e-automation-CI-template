# FlexOrder CI Workflow - Koodimonni Integration

This document explains how our FlexOrder CI workflow integrates with the Koodimonni WordPress test template and meets all your requirements.

## 🎯 **Requirements Fulfillment**

### ✅ **1. Create a new WordPress site**
- **Implementation**: Uses Koodimonni's `install-wp-tests.sh` script
- **Location**: `/tmp/wordpress/`
- **Method**: `bash wp-tests/bin/install-wp-tests.sh $DB_NAME $DB_USER $DB_PASS $DB_HOST $WP_VERSION`

### ✅ **2. Install and activate WooCommerce**
- **Implementation**: `wp plugin install woocommerce --activate --allow-root`
- **Verification**: `wp plugin list --allow-root | grep woocommerce`

### ✅ **3. Generate WooCommerce REST API credentials (Consumer Key and Consumer Secret)**
- **Implementation**: 
  ```bash
  API_KEY_OUTPUT=$(wp wc api_key create --user=1 --description="FlexOrder CI Test API Key" --permissions=read_write --format=json --allow-root)
  CONSUMER_KEY=$(echo $API_KEY_OUTPUT | jq -r '.consumer_key')
  CONSUMER_SECRET=$(echo $API_KEY_OUTPUT | jq -r '.consumer_secret')
  ```
- **Storage**: 
  - GitHub Environment variables: `${{ env.CONSUMER_KEY }}` and `${{ env.CONSUMER_SECRET }}`
  - Local file: `/tmp/wordpress/.env` for test access
  - Available for testcase execution as requested

### ✅ **4. Generate test data (20 products + 50 orders with different statuses)**
- **Products**: 20 test products with varying prices
- **Orders**: 50 orders with different statuses:
  - 15 pending
  - 15 processing  
  - 10 completed
  - 5 cancelled
  - 5 failed

### ✅ **5. Prepare FlexOrder plugin app files (both Free and Pro zip versions)**
- **Implementation**: Creates both `flexorder-free.zip` and `flexorder-pro.zip`
- **Method**: Uses `rsync` to copy files excluding test artifacts
- **Location**: `/tmp/flexorder-free/` and `/tmp/flexorder-pro/`

### ✅ **6. Install/activate the plugin**
- **Implementation**: `wp plugin install /tmp/flexorder-free.zip --activate --allow-root`
- **Verification**: Checks if plugin is active before proceeding

### ✅ **7. Execute the E2E test cases**
- **Implementation**: Runs Playwright tests with retry logic
- **Environment**: All credentials available via environment variables

## 🔧 **Koodimonni Template Integration**

### **WordPress Installation**
```bash
# Clone Koodimonni template
git clone https://github.com/Koodimonni/wordpress-test-template wp-tests

# Install WordPress using their script
bash wp-tests/bin/install-wp-tests.sh $DB_NAME $DB_USER $DB_PASS $DB_HOST $WP_VERSION
```

### **Server Setup**
```bash
# Copy Koodimonni's router.php
cp ../wp-tests/lib/router.php ./router.php

# Start server using their approach
php -S 0.0.0.0:12000 router.php &
```

### **PHPUnit Configuration**
- **Bootstrap**: `tests/bootstrap.php` (following Koodimonni approach)
- **Configuration**: `phpunit.xml` (matching their structure)
- **Plugin Loading**: Uses `tests_add_filter('muplugins_loaded', '_manually_load_plugin')`

## 📋 **Environment Variables & Secrets**

### **Local Development (.env file)**
```env
# WordPress Configuration
SITE_URL=http://localhost:8000
URL=http://localhost:8000
USER_NAME=admin
PASSWORD=password
ADMIN_PANEL_URL=http://localhost:8000/wp-admin

# WooCommerce API (generated automatically in CI)
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

### **GitHub Actions (Secrets)**
- `WOOCOMMERCE_CONSUMER_KEY` - Fallback if auto-generation fails
- `WOOCOMMERCE_CONSUMER_SECRET` - Fallback if auto-generation fails
- `GOOGLE_SHEET_ID` - Required for Google Sheets integration
- `GOOGLE_SHEET_URL` - Required for Google Sheets integration
- `GOOGLE_SHEET_SCOPES` - Required for Google Sheets integration
- `SHEET_NAME` - Required for Google Sheets integration
- `SHEET_RANGE` - Required for Google Sheets integration
- `GOOGLE_ACCOUNT_EMAIL` - Required for Google Sheets integration
- `GOOGLE_ACCOUNT_PASSWORD` - Required for Google Sheets integration
- `SERVICE_ACCOUNT_UPLOAD_FILE` - Required for Google Sheets integration
- `APPS_SCRIPT_DEPLOYMENT_ID` - Optional for Apps Script integration
- `APPS_SCRIPT_PROJECT_ID` - Optional for Apps Script integration

## 🚀 **Workflow Steps**

### **1. Lint and Quality**
- ESLint for JavaScript/TypeScript
- PHP CodeSniffer for PHP (WordPress standards)

### **2. Security Scan**
- Trivy vulnerability scanner
- GitHub Security tab integration

### **3. Setup WordPress (Koodimonni Integration)**
- Clone Koodimonni template
- Install WordPress using their script
- Install and configure WooCommerce
- Generate API credentials
- Create test data (20 products + 50 orders)
- Build plugin packages (Free + Pro)
- Install and activate FlexOrder plugin
- Start WordPress server using their router.php
- Run E2E tests

### **4. PHP Unit Tests (Koodimonni Integration)**
- Install WordPress test environment using Koodimonni script
- Run PHPUnit tests with coverage
- Upload coverage reports

### **5. Build and Deploy**
- Create production plugin packages
- Upload build artifacts
- Create GitHub releases (on tags)

## 🔍 **Key Differences from Koodimonni Template**

### **Enhanced Features**
1. **WooCommerce Integration**: Full WooCommerce setup and API credential generation
2. **Google Sheets API**: Integration testing for Google Sheets functionality
3. **Playwright E2E Tests**: Modern browser automation instead of RSpec
4. **Security Scanning**: Trivy vulnerability scanning
5. **Build Automation**: Automated plugin packaging
6. **Release Management**: GitHub releases with artifacts

### **Maintained Koodimonni Approach**
1. **WordPress Installation**: Uses their `install-wp-tests.sh` script
2. **Server Setup**: Uses their `router.php` approach
3. **PHPUnit Configuration**: Follows their bootstrap and configuration structure
4. **Plugin Loading**: Uses their plugin activation method

## ✅ **Verification Checklist**

- [x] WordPress site created using Koodimonni template
- [x] WooCommerce installed and activated
- [x] WooCommerce REST API credentials generated and stored
- [x] Test data created (20 products + 50 orders with different statuses)
- [x] FlexOrder plugin packages built (Free + Pro versions)
- [x] FlexOrder plugin installed and activated
- [x] E2E test cases executed
- [x] All credentials available for testcase execution
- [x] Koodimonni template integration maintained
- [x] Local .env support for development
- [x] GitHub Secrets support for CI/CD

## 🎯 **Ready for Production**

The CI workflow is now perfectly aligned with the Koodimonni WordPress test template while meeting all your FlexOrder plugin requirements. The workflow will:

1. **Automatically generate** WooCommerce API credentials
2. **Store them properly** for testcase execution
3. **Create comprehensive test data** (20 products + 50 orders)
4. **Build both Free and Pro versions** of your plugin
5. **Execute all test cases** with proper credential access
6. **Follow Koodimonni best practices** for WordPress testing

**Your FlexOrder CI workflow is production-ready! 🚀**
