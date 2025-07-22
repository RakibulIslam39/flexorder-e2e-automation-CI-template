const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/login');
const { OrderSyncSettingsPage } = require('../pages/ultimateSettings');
const GoogleSheetAPI = require('../../test-utils/gsApiCall');

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const AUTH_CONFIG_PATH = process.env.SERVICE_ACCOUNT_UPLOAD_FILE;
let googleSheetAPI;

// Helper functions
function getExcelColumnLetter(columnIndex) {
    let letter = '';
    while (columnIndex >= 0) {
        letter = String.fromCharCode((columnIndex % 26) + 65) + letter;
        columnIndex = Math.floor(columnIndex / 26) - 1;
    }
    return letter;
}

async function getCellValueByHeader(spreadsheetId, headerName, maxAttempts = 3, delay = 2000) {
    let attempt = 0;
    let lastError = null;
    
    while (attempt < maxAttempts) {
        attempt++;
        try {
            const headerRow = await googleSheetAPI.readFromSheet(spreadsheetId, 'A1:ZZ1');
            if (!headerRow || !headerRow[0]) {
                throw new Error('No header row found in the sheet');
            }
            
            const columnIndex = headerRow[0].findIndex(col => col && col.trim() === headerName);
            if (columnIndex === -1) {
                throw new Error(`Header "${headerName}" not found in sheet`);
            }

            const columnLetter = getExcelColumnLetter(columnIndex);
            const columnRange = `${columnLetter}2:${columnLetter}2`;

            const value = await googleSheetAPI.readFromSheet(spreadsheetId, columnRange);
            const safeValue = (value && value[0] && value[0][0]) ? value[0][0].toString().trim() : '';

            return { columnLetter, value: safeValue };
        } catch (error) {
            lastError = error;
            if (attempt < maxAttempts) {
                console.log(`Attempt ${attempt} failed for "${headerName}". Retrying in ${delay}ms...`);
                await new Promise(res => setTimeout(res, delay));
            }
        }
    }
    
    throw new Error(`Failed to get cell value after ${maxAttempts} attempts. Last error: ${lastError.message}`);
}

async function waitForHeaderToAppear(spreadsheetId, expectedHeader, timeout = 30000, pollInterval = 2000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
        try {
            const headerRow = await googleSheetAPI.readFromSheet(spreadsheetId, 'A1:ZZ1');
            if (!headerRow || !headerRow[0]) {
                throw new Error('No header row found');
            }
            
            const columnIndex = headerRow[0].findIndex(col => col && col.trim() === expectedHeader);
            if (columnIndex !== -1) {
                return columnIndex;
            }
        } catch (error) {
            console.log(`Error checking for header "${expectedHeader}": ${error.message}`);
        }
        
        await new Promise(res => setTimeout(res, pollInterval));
    }
    
    throw new Error(`Header "${expectedHeader}" not found within ${timeout}ms`);
}

async function waitForSheetUpdate(pageAction, spreadsheetId, columnName) {
    await pageAction();
    const colIndex = await waitForHeaderToAppear(spreadsheetId, columnName);
    const columnLetter = getExcelColumnLetter(colIndex);
    return `${columnLetter}2:${columnLetter}100`;
}

// Value parsers
const valueParsers = {
    orderId: (value) => {
        const numericValue = String(value).match(/\d+/);
        if (!numericValue) throw new Error(`Invalid Order ID format: ${value}`);
        return parseInt(numericValue[0], 10);
    },
    orderDate: (value) => {
        const parts = value.split(' ');
        if (parts.length !== 2) throw new Error(`Invalid date format: ${value}`);

        const [datePart, timePart] = parts;
        const timeParts = timePart.split(':');
        
        if (timeParts[0].length === 1) timeParts[0] = '0' + timeParts[0];
        const normalizedTime = timeParts.join(':');

        const isoString = `${datePart}T${normalizedTime}`;
        const date = new Date(isoString);

        if (isNaN(date.getTime())) throw new Error(`Invalid date format: ${value}`);
        return date.getTime();
    },
    price: (value) => {
        const cleaned = value.replace(/[^0-9.]/g, '');
        const num = parseFloat(cleaned);
        if (isNaN(num)) throw new Error(`Invalid price format: ${value}`);
        return num;
    },
    itemCount: (value) => {
        const cleaned = value.replace(/[^0-9.]/g, '');
        const num = parseFloat(cleaned);
        if (isNaN(num)) throw new Error(`Invalid item count format: ${value}`);
        return num;
    }
};

async function validateSorting({
    SPREADSHEET_ID,
    dataRange,
    valueParser,
    sortDirection = 'asc',
    maxAttempts = 3,
    delayBetweenAttempts = 10000
}) {
    let validationPassed = false;
    let attempt = 0;
    let values = [];
    let rawValues = [];
    let allErrors = [];

    while (attempt < maxAttempts && !validationPassed) {
        attempt++;
        console.log(`Validation attempt ${attempt} of ${maxAttempts}`);

        try {
            rawValues = await googleSheetAPI.readFromSheet(SPREADSHEET_ID, dataRange) || [];
            values = rawValues
                .map((row, index) => {
                    if (!row || !row[0]) {
                        console.warn(`Empty value at row ${index + 2}`);
                        return null;
                    }
                    return valueParser(row[0], index);
                })
                .filter(val => val !== null);

            if (values.length < 2) {
                throw new Error('Not enough valid values to validate sorting');
            }

            console.log(`First 5 values (${sortDirection} check):`, values.slice(0, 5));
            console.log(`Last 5 values:`, values.slice(-5));

            const errors = [];
            for (let i = 1; i < values.length; i++) {
                const prev = values[i - 1];
                const curr = values[i];
                
                if (
                    (sortDirection === 'asc' && curr < prev) ||
                    (sortDirection === 'desc' && curr > prev)
                ) {
                    errors.push({
                        row: i + 2,
                        current: curr,
                        previous: prev,
                        message: sortDirection === 'asc' 
                            ? `Row ${i + 2} (${curr}) should be >= row ${i + 1} (${prev})`
                            : `Row ${i + 2} (${curr}) should be <= row ${i + 1} (${prev})`
                    });
                }
            }

            if (errors.length === 0) {
                validationPassed = true;
                console.log(`✅ All values are properly sorted in ${sortDirection} order`);
            } else {
                allErrors = errors;
                console.error(`❌ Found ${errors.length} sorting errors. First 5 errors:`);
                errors.slice(0, 5).forEach(error => console.error(error.message));
                
                if (attempt < maxAttempts) {
                    console.log(`Waiting ${delayBetweenAttempts/1000} seconds before retry...`);
                    await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
                }
            }
        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error.message);
            if (attempt >= maxAttempts) throw error;
            await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
        }
    }

    if (!validationPassed) {
        const errorDetails = values.map((val, index) => 
            `Row ${index + 2}: ${val}${index > 0 ? ` (Δ=${val - values[index-1]})` : ''}`
        ).join('\n');
        
        throw new Error(
            `Failed to validate ${sortDirection} order after ${maxAttempts} attempts.\n` +
            `First error: ${allErrors[0]?.message}\n` +
            `Value sequence:\n${errorDetails}`
        );
    }

    return { values, rawValues };
}

test.beforeAll(() => {
    googleSheetAPI = new GoogleSheetAPI(AUTH_CONFIG_PATH);
});

test.describe('Ultimate Settings Toggle Validation', () => {
    let loginPage;
    let ultimateSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        ultimateSettingsPage = new OrderSyncSettingsPage(page);
        
        await loginPage.navigate();
        await loginPage.login();
        await ultimateSettingsPage.navigateToSettings();
    });

    // Basic toggle validations
    const basicToggleTests = [
        { toggle: 'syncCustomOrderStatus', header: 'Order Status', allowBlank: false }, // false means it should have a value
        { toggle: 'displayTotalItems', header: 'Total Items', allowBlank: false },
        { toggle: 'syncProductSku', header: 'Product SKU', allowBlank: true }, // true means it can be empty
        { toggle: 'displayTotalPrice', header: 'Total Price', allowBlank: false },
        { toggle: 'displayTotalDiscount', header: 'Total Discount', allowBlank: true },
        { toggle: 'displayOrderDate', header: 'Order Date', allowBlank: false },
        { toggle: 'displayPaymentMethod', header: 'Payment Method', allowBlank: true },
        { toggle: 'displayCustomerNote', header: 'Customer Note', allowBlank: true },
        { toggle: 'displayOrderNote', header: 'Order Note', allowBlank: true },
        { toggle: 'displayOrderPlacement', header: 'Order Placed by', allowBlank: false },
        { toggle: 'displayOrderUrl', header: 'Order URL', allowBlank: false },
        { toggle: 'displayTransactionID', header: 'Transaction ID', allowBlank: true },
    ];

    for (const { toggle, header, allowBlank } of basicToggleTests) {
        test(`Ultimate Settings ${header} Validation`, async () => {
            await ultimateSettingsPage.toggleOption(toggle);
            await ultimateSettingsPage.saveChanges();

            const { columnLetter, value } = await getCellValueByHeader(SPREADSHEET_ID, header);

            if (!allowBlank) {
                expect(value, `"${header}" value missing at ${columnLetter}2`).toBeTruthy();
                console.log(`✅ "${header}" has valid value at ${columnLetter}2:`, value);
            } else {
                if (value) {
                    console.log(`✅ "${header}" has optional value at ${columnLetter}2:`, value);
                } else {
                    console.log(`⚠️ "${header}" is optional and empty at ${columnLetter}2`);
                }
            }
        });
    }

    // Address validation tests
    test('Ultimate Settings Display Billing Address Validation', async () => {

        await ultimateSettingsPage.disableMakeBillingShippingSeparateToggle();
        await ultimateSettingsPage.toggleOption('displayBillingAddress');
        await ultimateSettingsPage.saveChanges();

        const billingColumnIndex = await waitForHeaderToAppear(SPREADSHEET_ID, "Billing Details");
        const columnLetter = getExcelColumnLetter(billingColumnIndex);
        const dataRange = `${columnLetter}2:${columnLetter}2`;

        const value = await googleSheetAPI.readFromSheet(SPREADSHEET_ID, dataRange);
        const billingValue = value?.[0]?.[0] || '';

        expect(billingValue).toBeTruthy();
        console.log(`✅ Billing Details found at column ${columnLetter}:`, billingValue);
    });

    test('Ultimate Settings Display Shipping Address Validation', async () => {
        
        await ultimateSettingsPage.disableMakeBillingShippingSeparateToggle();
        await ultimateSettingsPage.toggleOption('displayShippingAddress');
        await ultimateSettingsPage.saveChanges();

        const shippingColumnIndex = await waitForHeaderToAppear(SPREADSHEET_ID, "Shipping Details");
        const columnLetter = getExcelColumnLetter(shippingColumnIndex);
        const dataRange = `${columnLetter}2:${columnLetter}2`;

        const value = await googleSheetAPI.readFromSheet(SPREADSHEET_ID, dataRange);
        const shippingValue = value?.[0]?.[0] || '';

        expect(shippingValue).toBeTruthy();
        console.log(`✅ Shipping Details found at column ${columnLetter}:`, shippingValue);
    });

    // Separate columns validation
    test('Ultimate Settings - Use separate columns for shipping & billing information', async () => {
        
        await ultimateSettingsPage.toggleOption('separateShippingBillingInfo');
        await ultimateSettingsPage.saveChanges();
 
        await new Promise(res => setTimeout(res, 10000));
        const expectedHeaders = [
            "Billing First Name", "Billing Last Name", "Billing Address 1", "Billing City",
            "Billing Postcode", "Billing Country", "Billing Address 2", "Billing Company",
            "Billing State", "Billing Email", "Billing Phone",
            "Shipping First Name", "Shipping Last Name", "Shipping Address 1", "Shipping City",
            "Shipping Postcode", "Shipping Country", "Shipping Address 2", "Shipping Company",
            "Shipping State", "Shipping Email", "Shipping Phone"
        ];

        const headerRow = await googleSheetAPI.readFromSheet(SPREADSHEET_ID, 'A1:ZZ1');
        const allHeaders = headerRow[0] || [];

        const missingHeaders = expectedHeaders.filter(header => 
            !allHeaders.some(col => col.trim() === header)
        );

        console.log('Found headers:', allHeaders);
        console.log('Missing headers:', missingHeaders);

        expect(missingHeaders.length, `Missing headers: ${missingHeaders.join(', ')}`).toBe(0);
    });

    // Product display tests
    test('Ultimate Settings use separate rows to show multiple products of an order', async () => {
        
        await ultimateSettingsPage.toggleOption('separateShowMultipleProductsOfOrder');
        await ultimateSettingsPage.saveChanges();

        await new Promise(res => setTimeout(res, 10000));
        const orderIdColumnIndex = await waitForHeaderToAppear(SPREADSHEET_ID, "Order ID");
        const productNameColumnIndex = await waitForHeaderToAppear(SPREADSHEET_ID, "Product Names");

        const orderIdColumnLetter = getExcelColumnLetter(orderIdColumnIndex);
        const productNameColumnLetter = getExcelColumnLetter(productNameColumnIndex);
        const readRange = `${orderIdColumnLetter}2:${productNameColumnLetter}100`;

        const data = await googleSheetAPI.readFromSheet(SPREADSHEET_ID, readRange);

        const firstOrderId = data[0]?.[0];
        expect.soft(firstOrderId).toBeTruthy();
        
        const matchedRows = data.filter(row => row[0] === firstOrderId);
        expect.soft(matchedRows.length).toBeGreaterThan(1);
        
        console.log(`Found ${matchedRows.length} product rows for Order ID: ${firstOrderId}`);
    });

    test('Ultimate Settings - Show Individual Product Validation', async () => {
        
        await ultimateSettingsPage.disableSeparateShowMultipleProductsOfOrderToggle();
        await ultimateSettingsPage.toggleOption('showIndividualProduct');
        await ultimateSettingsPage.saveChanges();

        await new Promise(res => setTimeout(res, 10000));
        const { columnLetter, value } = await getCellValueByHeader(SPREADSHEET_ID, "Product Names");
        expect.soft(value).toBeTruthy();
        console.log(`Found "Product Names" in column ${columnLetter}:`, value);

        const productList = value.split(/,\s(?=\w)/)
            .map(p => p.trim())
            .filter(p => p.length > 0);

        expect.soft(productList.length).toBeGreaterThan(0);

        const productRegex = /^(.+?)\s*\(qty:\s*(\d+),\s*price:\s*(\d+(?:\.\d{1,2})?)\)$/i;
        const invalidProducts = productList.filter(p => !productRegex.test(p));

        console.log('Product validation results:');
        productList.forEach(product => {
            if (productRegex.test(product)) {
                console.log(`✅ Valid: ${product}`);
            } else {
                console.log(`❌ Invalid: ${product}`);
            }
        });

        expect.soft(invalidProducts.length).toBe(0);
    });

    // Separator tests
    const separatorTests = [
        { 
            name: 'Comma', 
            method: 'commaSelectInformationSeparator',
            separator: ',',
            testRegex: /,/ 
        },
        { 
            name: 'Semicolon', 
            method: 'semicolonSelectInformationSeparator',
            separator: ';',
            testRegex: /;/ 
        },
        { 
            name: 'Vertical Bar', 
            method: 'verticalBarSelectInformationSeparator',
            separator: '|',
            testRegex: /\|/ 
        }
    ];

    for (const { name, method, separator, testRegex } of separatorTests) {
        test(`Ultimate Settings - Validate Product Names are separated by ${name}`, async () => {
            
            await ultimateSettingsPage[method]();
            await ultimateSettingsPage.saveChanges();

            await new Promise(res => setTimeout(res, 10000));
            const colIndex = await waitForHeaderToAppear(SPREADSHEET_ID, "Product Names");
            const columnLetter = getExcelColumnLetter(colIndex);
            const dataRange = `${columnLetter}2:${columnLetter}2`;
            
            const value = await googleSheetAPI.readFromSheet(SPREADSHEET_ID, dataRange);
            const rawData = value?.[0]?.[0] || '';

            expect.soft(rawData).toBeTruthy();
            expect.soft(testRegex.test(rawData)).toBe(true);

            const productList = rawData.split(separator)
                .map(p => p.trim())
                .filter(Boolean);

            expect.soft(productList.length).toBeGreaterThan(1);
            console.log(`${name}-separated products:`, productList);
        });
    }

    // Custom fields test
    test('Ultimate Settings Sync Order Custom Fields Validation', async ({ page }) => {
        
        await ultimateSettingsPage.toggleOption('syncOrderCustomFields');
        await ultimateSettingsPage.clearCustomFields();

        await page.getByRole('option', { name: '_billing_address_index' }).click();
        await page.getByText('××_billing_address_index').click();
        await page.getByRole('option', { name: '_shipping_address_index' }).click();
        await ultimateSettingsPage.saveChanges();

        await new Promise(res => setTimeout(res, 10000));
        const billingField = await getCellValueByHeader(SPREADSHEET_ID, '_billing_address_index');
        const shippingField = await getCellValueByHeader(SPREADSHEET_ID, '_shipping_address_index');

        expect.soft(billingField.value).toBeTruthy();
        expect.soft(shippingField.value).toBeTruthy();

        console.log(`Billing field: ${billingField.value}`);
        console.log(`Shipping field: ${shippingField.value}`);
    });

    // Sorting tests
    const sortingTests = [
        {
            name: 'Order Date Ascending',
            column: 'Order Date',
            sortMethod: 'orderDateAscending',
            parser: 'orderDate',
            direction: 'asc'
        },
        {
            name: 'Order Date Descending',
            column: 'Order Date',
            sortMethod: 'orderDateDescending',
            parser: 'orderDate',
            direction: 'desc'
        },
        {
            name: 'Order Price Ascending',
            column: 'Total Price',
            sortMethod: 'orderPriceAscending',
            parser: 'price',
            direction: 'asc'
        },
        {
            name: 'Order Price Descending',
            column: 'Total Price',
            sortMethod: 'orderPriceDescending',
            parser: 'price',
            direction: 'desc'
        },
        {
            name: 'Order Items Ascending',
            column: 'Total Items',
            sortMethod: 'orderItemsAscending',
            parser: 'itemCount',
            direction: 'asc'
        },
        {
            name: 'Order Items Descending',
            column: 'Total Items',
            sortMethod: 'orderItemsDescending',
            parser: 'itemCount',
            direction: 'desc'
        },
        {
            name: 'Order ID Descending',
            column: 'Order ID',
            sortMethod: 'orderIdDescending',
            parser: 'orderId',
            direction: 'desc'
        },
        {
            name: 'Order ID Ascending',
            column: 'Order ID',
            sortMethod: 'orderIdAscending',
            parser: 'orderId',
            direction: 'asc'
        }
    ];

    for (const { name, column, sortMethod, parser, direction } of sortingTests) {
        test(`Ultimate Settings - ${name} Sort Validation on Google Sheets`, async () => {
            
            const dataRange = await waitForSheetUpdate(async () => {
                if (column !== 'Order ID') {
                    await ultimateSettingsPage.toggleOption(`display${column.replace(' ', '')}`);
                }
                await ultimateSettingsPage.toggleOption('allowSortingOnGoogleSheets');
                await ultimateSettingsPage[sortMethod]();
                await ultimateSettingsPage.saveChanges();
            }, SPREADSHEET_ID, column);

            await new Promise(res => setTimeout(res, 10000));
            await validateSorting({
                SPREADSHEET_ID,
                dataRange,
                valueParser: valueParsers[parser],
                sortDirection: direction
            });
        });
    }
});