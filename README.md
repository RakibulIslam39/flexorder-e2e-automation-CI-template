
# FlexOrder Automation
FlexOrder Automation is a Playwright-based automation framework designed for testing the FlexOrder plugin. It ensures seamless integration and functionality by automating test cases for order synchronization, settings configuration, and WooCommerce interactions.



## Prerequisites
* Node.js (>= v16)
* Playwright (latest version)
* Google Cloud Service Account for API access
* WooCommerce store with FlexOrder plugin installed


## Installation
1. Clone the repository:
https://github.com/RakibulIslam39/FlexOrder-automation.git

2. Install dependencies:
npm install

3. Install Playwright dependencies:
npx playwright install

4. Set up Google Cloud credentials and store the JSON key in:

tests/utilities/credentials.json.
## Running Tests
* Run all test cases:
npx playwright test

* Run specific test file:
npx playwright test tests/testcase/setup.spec.js

* Generate and view test report:
npx playwright show-report


## Test Cases
* Create a new order using WooCommerce API
* Verify that the order exists in Google Sheets
* Write "Update Order Status" values to Google Sheet
* Setup Add Credentials and Upload File Test
* Ultimate Settings Sync Custom Order Status Validation
* Ultimate Settings Display Total Items Validation
* Ultimate Settings Sync Product SKU Validation
* Ultimate Settings Display Total Price Validation
* Ultimate Settings Display Total Discount Validation
* Ultimate Settings Show Individual Product Validation
* Ultimate Settings Display Billing Address Validation
* Ultimate Settings Display Shipping Address Validation
* Ultimate Settings Display Order Date Validation
* Ultimate Settings Display Payment Method Validation
* Ultimate Settings Display Customer Note Validation
* Ultimate Settings Display Order Note Validation
* Ultimate Settings Display Order Placement Validation
* Ultimate Settings Display Order URL Validation
* Ultimate Settings Sync Order Custom Fields Validation
* should fetch and verify current order status
* should update order status to a new valid status
* should validate status update in WooCommerce




## Contact
For support or inquiries, contact rakibul.cse.bubt@gmail.com.

