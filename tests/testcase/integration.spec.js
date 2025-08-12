// const { test, expect } = require('@playwright/test');
// const { LoginPage } = require('../pages/login');
// const { woocommerceAPI } = require('../../test-utils/woocommerce-api');
// const { googleSheetsAPI } = require('../../test-utils/google-sheets-api');
// const { credentialsManager } = require('../../config/credentials');

// test.describe('FlexOrder Plugin Integration Tests', () => {
//   let loginPage;
//   let createdOrders = [];
//   let createdProducts = [];

//   test.beforeAll(async () => {
//     // Validate credentials before running tests
//     try {
//       credentialsManager.validateCredentials();
//     } catch (error) {
//       test.fail(`Credential validation failed: ${error.message}`);
//     }
//   });

//   test.beforeEach(async ({ page }) => {
//     loginPage = new LoginPage(page);
//   });

//   test.afterEach(async () => {
//     // Cleanup created test data
//     for (const orderId of createdOrders) {
//       try {
//         await woocommerceAPI.updateOrderStatus(orderId, 'cancelled');
//       } catch (error) {
//         console.log(`Failed to cleanup order ${orderId}:`, error.message);
//       }
//     }
//     createdOrders = [];

//     for (const productId of createdProducts) {
//       try {
//         await woocommerceAPI.api.delete(`products/${productId}`);
//       } catch (error) {
//         console.log(`Failed to cleanup product ${productId}:`, error.message);
//       }
//     }
//     createdProducts = [];
//   });

//   test('@api @smoke WooCommerce API connection test', async () => {
//     const isConnected = await woocommerceAPI.testConnection();
//     expect(isConnected).toBe(true);
//   });

//   test('@api @smoke Google Sheets API connection test', async () => {
//     const isConnected = await googleSheetsAPI.testConnection();
//     expect(isConnected).toBe(true);
//   });

//   test('@api Create WooCommerce order and verify Google Sheets sync', async () => {
//     // Create test product
//     const productData = {
//       name: 'Test Product for Order',
//       type: 'simple',
//       regular_price: '29.99',
//       description: 'Test product for automation',
//       short_description: 'Test product',
//       categories: [{ name: 'Test Category' }],
//       images: [],
//       status: 'publish'
//     };

//     const product = await woocommerceAPI.createProduct(productData);
//     createdProducts.push(product.id);
//     expect(product.id).toBeDefined();

//     // Create order with the product
//     const orderData = {
//       payment_method: 'bacs',
//       payment_method_title: 'Direct bank transfer',
//       set_paid: true,
//       billing: {
//         first_name: 'John',
//         last_name: 'Doe',
//         address_1: '969 Market',
//         address_2: '',
//         city: 'San Francisco',
//         state: 'CA',
//         postcode: '94103',
//         country: 'US',
//         email: 'john.doe@example.com',
//         phone: '(555) 555-5555'
//       },
//       shipping: {
//         first_name: 'John',
//         last_name: 'Doe',
//         address_1: '969 Market',
//         address_2: '',
//         city: 'San Francisco',
//         state: 'CA',
//         postcode: '94103',
//         country: 'US'
//       },
//       line_items: [
//         {
//           product_id: product.id,
//           quantity: 2
//         }
//       ],
//       status: 'processing'
//     };

//     const order = await woocommerceAPI.createOrder(orderData);
//     createdOrders.push(order.id);
//     expect(order.id).toBeDefined();
//     expect(order.status).toBe('processing');

//     // Wait for sync to Google Sheets
//     await test.step('Wait for Google Sheets sync', async () => {
//       // Wait up to 30 seconds for sync
//       for (let i = 0; i < 30; i++) {
//         try {
//           const sheetData = await googleSheetsAPI.readSheetData();
//           const orderRow = sheetData.find(row => 
//             row[0] && row[0].toString() === order.id.toString()
//           );
//           if (orderRow) {
//             expect(orderRow[0]).toBe(order.id.toString());
//             expect(orderRow[2]).toBe('processing'); // status column
//             return;
//           }
//         } catch (error) {
//           console.log(`Attempt ${i + 1}: Order not found in sheets yet`);
//         }
//         await new Promise(resolve => setTimeout(resolve, 1000));
//       }
//       throw new Error('Order not synced to Google Sheets within 30 seconds');
//     });
//   });

//   test('@api Update order status and verify Google Sheets update', async () => {
//     // Create a test order first
//     const orderData = {
//       payment_method: 'bacs',
//       payment_method_title: 'Direct bank transfer',
//       set_paid: true,
//       billing: {
//         first_name: 'Jane',
//         last_name: 'Smith',
//         address_1: '123 Test St',
//         city: 'Test City',
//         state: 'TS',
//         postcode: '12345',
//         country: 'US',
//         email: 'jane.smith@example.com',
//         phone: '(555) 123-4567'
//       },
//       shipping: {
//         first_name: 'Jane',
//         last_name: 'Smith',
//         address_1: '123 Test St',
//         city: 'Test City',
//         state: 'TS',
//         postcode: '12345',
//         country: 'US'
//       },
//       line_items: [
//         {
//           product_id: 1, // Use existing product
//           quantity: 1
//         }
//       ],
//       status: 'pending'
//     };

//     const order = await woocommerceAPI.createOrder(orderData);
//     createdOrders.push(order.id);

//     // Wait for initial sync
//     await new Promise(resolve => setTimeout(resolve, 5000));

//     // Update order status
//     const updatedOrder = await woocommerceAPI.updateOrderStatus(order.id, 'completed');
//     expect(updatedOrder.status).toBe('completed');

//     // Verify status update in Google Sheets
//     await test.step('Verify status update in Google Sheets', async () => {
//       for (let i = 0; i < 30; i++) {
//         try {
//           const sheetData = await googleSheetsAPI.readSheetData();
//           const orderRow = sheetData.find(row => 
//             row[0] && row[0].toString() === order.id.toString()
//           );
//           if (orderRow && orderRow[2] === 'completed') {
//             expect(orderRow[2]).toBe('completed');
//             return;
//           }
//         } catch (error) {
//           console.log(`Attempt ${i + 1}: Status update not reflected yet`);
//         }
//         await new Promise(resolve => setTimeout(resolve, 1000));
//       }
//       throw new Error('Order status update not synced to Google Sheets within 30 seconds');
//     });
//   });

//   test('@api Bulk order creation and sync verification', async () => {
//     const ordersToCreate = 5;
//     const createdOrderIds = [];

//     // Create multiple orders
//     for (let i = 0; i < ordersToCreate; i++) {
//       const orderData = {
//         payment_method: 'bacs',
//         payment_method_title: 'Direct bank transfer',
//         set_paid: true,
//         billing: {
//           first_name: `Bulk${i}`,
//           last_name: 'Test',
//           address_1: `${i} Test Ave`,
//           city: 'Test City',
//           state: 'TS',
//           postcode: '12345',
//           country: 'US',
//           email: `bulk${i}@example.com`,
//           phone: `(555) ${String(i).padStart(3, '0')}-0000`
//         },
//         shipping: {
//           first_name: `Bulk${i}`,
//           last_name: 'Test',
//           address_1: `${i} Test Ave`,
//           city: 'Test City',
//           state: 'TS',
//           postcode: '12345',
//           country: 'US'
//         },
//         line_items: [
//           {
//             product_id: 1,
//             quantity: i + 1
//           }
//         ],
//         status: 'processing'
//       };

//       const order = await woocommerceAPI.createOrder(orderData);
//       createdOrderIds.push(order.id);
//       createdOrders.push(order.id);
//     }

//     // Verify all orders are synced to Google Sheets
//     await test.step('Verify bulk sync to Google Sheets', async () => {
//       for (let i = 0; i < 60; i++) { // Wait up to 60 seconds for bulk sync
//         try {
//           const sheetData = await googleSheetsAPI.readSheetData();
//           const syncedOrders = createdOrderIds.filter(orderId => 
//             sheetData.some(row => row[0] && row[0].toString() === orderId.toString())
//           );
          
//           if (syncedOrders.length === ordersToCreate) {
//             expect(syncedOrders.length).toBe(ordersToCreate);
//             return;
//           }
//         } catch (error) {
//           console.log(`Attempt ${i + 1}: ${syncedOrders?.length || 0}/${ordersToCreate} orders synced`);
//         }
//         await new Promise(resolve => setTimeout(resolve, 1000));
//       }
//       throw new Error(`Only ${syncedOrders?.length || 0}/${ordersToCreate} orders synced within 60 seconds`);
//     });
//   });

//   test('@ui WordPress admin login and plugin verification', async ({ page }) => {
//     await loginPage.navigate();
//     await loginPage.login();

//     // Verify we're in WordPress admin
//     await expect(page).toHaveURL(/wp-admin/);
//     await expect(page.locator('#wpadminbar')).toBeVisible();

//     // Navigate to plugins page and verify FlexOrder is active
//     await page.goto('/wp-admin/plugins.php');
//     await expect(page.locator('text=FlexOrder').first()).toBeVisible();
//     await expect(page.locator('text=Deactivate').first()).toBeVisible();
//   });

//   test('@ui WooCommerce settings verification', async ({ page }) => {
//     await loginPage.navigate();
//     await loginPage.login();

//     // Navigate to WooCommerce settings
//     await page.goto('/wp-admin/admin.php?page=wc-settings');
//     await expect(page.locator('h1:has-text("WooCommerce")')).toBeVisible();
//     await expect(page.locator('text=Settings')).toBeVisible();
//   });
// });
