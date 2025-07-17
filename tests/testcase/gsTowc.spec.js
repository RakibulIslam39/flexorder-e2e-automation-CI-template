const { test, expect } = require('@playwright/test');
const GoogleSheetAPI = require('../pages/gsTowc');

const SPREADSHEET_ID = '1Q_DuF-dWj9cH0AN8TzIhoHW07BVy1Akj4LbkHDigeQM';
const RANGE = 'Orders!C2';
const AUTH_CONFIG_PATH = './tests/utilities/upload_key.json';

test.describe('Google Sheets to WooCommerce Automation', () => {
    let googleSheetAPI;

    test.beforeAll(() => {
        googleSheetAPI = new GoogleSheetAPI(AUTH_CONFIG_PATH);
    });

    test('Write "Update Order Status" values to Google Sheet', async () => {
        const data = Array(300).fill(['wc-pending']);

        const response = await googleSheetAPI.writeToSheet(SPREADSHEET_ID, RANGE, data);
        console.log('Update response:', response);

        expect.soft(response.updatedRange).toContain(RANGE.split('!')[0]);
        expect.soft(response.updatedCells).toBe(300);
    });
});
