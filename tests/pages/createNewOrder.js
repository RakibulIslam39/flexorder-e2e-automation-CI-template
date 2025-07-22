const { expect } = require('@playwright/test');
require('dotenv').config();

class CreateNewOrder {
  constructor(page) {
    this.page = page;
    this.googleSheetUrl = process.env.GOOGLE_SHEET_URL;
    this.googleAccountEmail = process.env.GOOGLE_ACCOUNT_EMAIL;
    this.googleAccountPassword = process.env.GOOGLE_ACCOUNT_PASSWORD;
  }

  async navigateToGoogleSheet() {
    await this.page.goto(this.googleSheetUrl);
  }

  async loginToGoogle() {
    await this.page.getByRole('link', { name: 'সাইন-ইন করুন' }).click();
    await this.page.getByRole('textbox', { name: 'Email or phone' }).fill(this.googleAccountEmail);
    await this.page.getByRole('button', { name: 'Next' }).click();
    await this.page.getByRole('textbox', { name: 'Enter your password' }).fill(this.googleAccountPassword);
    await this.page.getByRole('button', { name: 'Next' }).click();
    await this.page.waitForURL(this.googleSheetUrl);
  }

  async openCreateOrderForm() {
    await this.page.getByRole('button', { name: 'Create New Order' }).click();
    await this.page.getByText('➕ Create Order').click();

    const authFrame = await this.getOrderFormFrame();
    await expect(authFrame.getByText('✅ Authorization successful!')).toBeVisible();
  }

  async getOrderFormFrame() {
    const complementaryFrame = this.page.getByRole('complementary', { name: 'Create New Order' }).locator('iframe');
    const sandboxFrame = await complementaryFrame.contentFrame();
    const userHtmlFrame = await sandboxFrame.locator('#sandboxFrame').contentFrame();
    return await userHtmlFrame.locator('#userHtmlFrame').contentFrame();
  }

  async fillProductInformation(productName, paymentMethod = 'cod') {
    const formFrame = await this.getOrderFormFrame();

    await formFrame.getByRole('textbox', { name: 'Search Products*' }).click();
    await formFrame.getByRole('textbox', { name: 'Search Products*' }).fill(productName);
    await formFrame.locator('.product-item').first().click();
    await formFrame.getByLabel('Payment Method*').selectOption(paymentMethod);
  }

  async fillCustomerInformation(customerData) {
    const formFrame = await this.getOrderFormFrame();

    await formFrame.locator('#customer_first_name').fill(customerData.firstName);
    await formFrame.locator('#customer_last_name').fill(customerData.lastName);
    await formFrame.getByRole('textbox', { name: 'Email*' }).fill(customerData.email);
    await formFrame.locator('#customer_phone').fill(customerData.phone);
    await formFrame.getByRole('textbox', { name: 'Customer Note' }).fill(customerData.note || '');
  }

  async fillBillingInformation(billingData) {
    const formFrame = await this.getOrderFormFrame();

    await formFrame.locator('#billing_first_name').fill(billingData.firstName);
    await formFrame.locator('#billing_last_name').fill(billingData.lastName);
    await formFrame.locator('#billing_company').fill(billingData.company);
    await formFrame.locator('#billing_address_line_1').fill(billingData.address1);
    await formFrame.locator('#billing_address_line_2').fill(billingData.address2);
    await formFrame.locator('#billing_city').fill(billingData.city);
    await formFrame.locator('#billing_state').fill(billingData.state);
    await formFrame.locator('#billing_postcode').fill(billingData.postcode);
    await formFrame.locator('#billing_country').fill(billingData.country);
    await formFrame.locator('#billing_email').fill(billingData.email);
    await formFrame.locator('#billing_phone').fill(billingData.phone);
  }

  async fillShippingInformation(shippingData) {
    const formFrame = await this.getOrderFormFrame();

    await formFrame.locator('#shipping_first_name').fill(shippingData.firstName);
    await formFrame.locator('#shipping_last_name').fill(shippingData.lastName);
    await formFrame.locator('#shipping_company').fill(shippingData.company);
    await formFrame.locator('#shipping_address_line_1').fill(shippingData.address1);
    await formFrame.locator('#shipping_address_line_2').fill(shippingData.address2);
    await formFrame.locator('#shipping_city').fill(shippingData.city);
    await formFrame.locator('#shipping_state').fill(shippingData.state);
    await formFrame.locator('#shipping_postcode').fill(shippingData.postcode);
    await formFrame.locator('#shipping_country').fill(shippingData.country);
    await formFrame.locator('#shipping_email').fill(shippingData.email);
    await formFrame.locator('#shipping_phone').fill(shippingData.phone);
  }

  async copyForBillingToShipping() {
    const formFrame = await this.getOrderFormFrame();
    await formFrame.getByRole('button', { name: 'Copy from Billing' }).click();

  }

  async submitOrder() {
    const formFrame = await this.getOrderFormFrame();
    await formFrame.getByRole('button', { name: 'Create Order' }).click();
    await expect(this.page.getByText('Orders refreshed with new')).toBeVisible();
  }
}

module.exports = CreateNewOrder;
