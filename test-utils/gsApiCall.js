const { google } = require('googleapis');

class GoogleSheetAPI {
    constructor(authConfigPath) {
        this.auth = new google.auth.GoogleAuth({
            keyFile: authConfigPath,
            scopes: [process.env.GOOGLE_SHEET_SCOPES],
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
            console.error('Error writing to sheet:', error);
            throw error;
        }
    }

    async readFromSheet(spreadsheetId, range) {
        const sheets = google.sheets({ version: 'v4', auth: this.auth });

        try {
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range,
            });
            return response.data.values;
        } catch (error) {
            console.error('Error reading from sheet:', error);
            throw error;
        }
    }
}

module.exports = GoogleSheetAPI;