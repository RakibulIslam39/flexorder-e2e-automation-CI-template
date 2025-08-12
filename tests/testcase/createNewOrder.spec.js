const { test, expect } = require('@playwright/test');
const CreateNewOrder = require('../pages/createNewOrder');
const { OrderStatusUpdater } = require('../../test-utils/updateOrderStatus');
require('dotenv').config();

const path = './tests/utilities/upload_key.json';

test.describe('Create New Order through Google Sheet', () => {
  let createNewOrder;
  let orderStatusUpdater;

  test.beforeEach(async ({ page }) => {
    createNewOrder = new CreateNewOrder(page);
    orderStatusUpdater = new OrderStatusUpdater(path);
    await createNewOrder.navigateToGoogleSheet();
    await createNewOrder.loginToGoogle();
  });

  test('should create a new order and validate in both systems(Google Sheet & WooCommerce)', async ({ page }) => {
    const productName = 'Football Net';
    const customerData = {
      firstName: 'Rakibul',
      lastName: 'Islam',
      email: 'rakibul1@wppool.dev',
      phone: '01705139111',
      note: 'test create account'
    };

    const billingData = {
      firstName: 'Rakibul',
      lastName: 'Islam',
      company: 'Wppool',
      address1: 'Dhaka',
      address2: 'Dhaka',
      city: 'Dhaka',
      state: 'Dhaka',
      postcode: '1212',
      country: 'Bangladesh',
      email: 'rakibul1@wppool.dev',
      phone: '01705139111'
    };

    await createNewOrder.openCreateOrderForm();
    await createNewOrder.fillProductInformation(productName);
    await createNewOrder.fillCustomerInformation(customerData);
    await createNewOrder.fillBillingInformation(billingData);
    const savingColumnLocator = page.getByText('Saving column preferences....');

    if (await savingColumnLocator.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('Column preferences alert is visible. Attempting to close...');
      await page.getByRole('alert').locator('div').first().click();
    } else {
      console.log('No column preferences alert found. Skipping...');
    }

    await createNewOrder.copyForBillingToShipping();
    await createNewOrder.submitOrder();

    const orders = await orderStatusUpdater.fetchOrders(process.env.SHEET_RANGE);
    const lastOrder = orders[orders.length - 1];
    const orderIdFromSheet = lastOrder[0];

    console.log('Last Order ID from Sheet:', orderIdFromSheet);

    const wcOrder = await orderStatusUpdater.fetchOrderFromWooCommerce(orderIdFromSheet);

    expect.soft(wcOrder.billing.first_name).toBe(billingData.firstName);
    expect.soft(wcOrder.billing.last_name).toBe(billingData.lastName);
    expect.soft(wcOrder.billing.address_1).toBe(billingData.address1);
    expect.soft(wcOrder.billing.city).toBe(billingData.city);
    expect.soft(wcOrder.billing.postcode).toBe(billingData.postcode);
    expect.soft(wcOrder.billing.email).toBe(billingData.email);
    expect.soft(wcOrder.billing.phone).toBe(billingData.phone);

    expect.soft(wcOrder.line_items[0].name).toContain(productName);
    console.log('WooCommerce order and Sheet order data matched.');
  });

  
  test('should create a new order and validate in both systems without copy billing address', async ({ page }) => {
    const productName = 'Football Net';
    const customerData = {
      firstName: 'Rakibul',
      lastName: 'Islam',
      email: 'rakibul1@wppool.dev',
      phone: '01705139111',
      note: 'test create account'
    };

    const billingData = {
      firstName: 'Rakibul',
      lastName: 'Islam',
      company: 'Wppool',
      address1: 'Mirpur-2',
      address2: 'Dhaka',
      city: 'Dhaka',
      state: 'Dhaka',
      postcode: '1212',
      country: 'Bangladesh',
      email: 'rakibul1@wppool.dev',
      phone: '01705139111'
    };

    const shippingData = {
      firstName: 'Tahsin',
      lastName: 'Rakib',
      company: 'WPPOOL',
      address1: 'Sirajganj Sadar',
      address2: 'Sirajganj',
      city: 'Sirajganj',
      state: 'Dhaka',
      postcode: '1212',
      country: 'Bangladesh',
      email: 'rakibul1@wppool.dev',
      phone: '01701026708'
    };

    await createNewOrder.openCreateOrderForm();
    await createNewOrder.fillProductInformation(productName);
    await createNewOrder.fillCustomerInformation(customerData);
    await createNewOrder.fillBillingInformation(billingData);
    const savingColumnLocator = page.getByText('Saving column preferences....');

    if (await savingColumnLocator.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('Column preferences alert is visible. Attempting to close...');
      await page.getByRole('alert').locator('div').first().click();
    } else {
      console.log('No column preferences alert found. Skipping...');
    }

    await createNewOrder.fillShippingInformation(shippingData);
    await createNewOrder.submitOrder();

    const orders = await orderStatusUpdater.fetchOrders(process.env.SHEET_RANGE);
    const lastOrder = orders[orders.length - 1];
    const orderIdFromSheet = lastOrder[0];

    console.log('Last Order ID from Sheet:', orderIdFromSheet);

    const wcOrder = await orderStatusUpdater.fetchOrderFromWooCommerce(orderIdFromSheet);

    // Billing validation
    expect.soft(wcOrder.billing.first_name).toBe(billingData.firstName);
    expect.soft(wcOrder.billing.last_name).toBe(billingData.lastName);
    expect.soft(wcOrder.billing.address_1).toBe(billingData.address1);
    expect.soft(wcOrder.billing.city).toBe(billingData.city);
    expect.soft(wcOrder.billing.postcode).toBe(billingData.postcode);
    expect.soft(wcOrder.billing.email).toBe(billingData.email);
    expect.soft(wcOrder.billing.phone).toBe(billingData.phone);

    // Shipping validation
    expect.soft(wcOrder.shipping.first_name).toBe(shippingData.firstName);
    expect.soft(wcOrder.shipping.last_name).toBe(shippingData.lastName);
    expect.soft(wcOrder.shipping.address_1).toBe(shippingData.address1);
    expect.soft(wcOrder.shipping.city).toBe(shippingData.city);
    expect.soft(wcOrder.shipping.postcode).toBe(shippingData.postcode);

    expect.soft(wcOrder.line_items[0].name).toContain(productName);
    console.log('WooCommerce order and Sheet order data matched.');
  });
});
