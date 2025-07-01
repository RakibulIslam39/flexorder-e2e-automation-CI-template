const { test, expect } = require('@playwright/test');
const { google } = require('googleapis');

class GoogleSheetAPI {
    constructor(authConfigPath) {
        this.auth = new google.auth.GoogleAuth({
            keyFile: authConfigPath,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
    }

    async writeToSheet(spreadsheetId, range, values) {
        const sheets = google.sheets({ version: 'v4', auth: this.auth });
        const valueInputOption = 'USER_ENTERED';
        const resource = { values };

        try {
            const response = await sheets.spreadsheets.values.update({
                spreadsheetId,
                range,
                valueInputOption,
                resource,
            });
            return response.data;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }
}

module.exports = GoogleSheetAPI;
