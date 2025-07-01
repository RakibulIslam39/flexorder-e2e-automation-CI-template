const { google } = require('googleapis');
require('dotenv').config();
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const updatedOrders = [];
const orderStatuses = [
    "wc-pending",
    "wc-processing", 
    "wc-on-hold",
    "wc-completed",
    "wc-cancelled",
    "wc-refunded",
    "wc-failed",
    "wc-checkout-draft"
];

class OrderStatusUpdater {
    constructor(authConfigPath) {
        this.authConfigPath = authConfigPath;
        this.auth = new google.auth.GoogleAuth({
            keyFile: this.authConfigPath,
            scopes: [process.env.GOOGLE_SHEET_SCOPES],
        });
        
        this.api = new WooCommerceRestApi({
            url: process.env.SITE_URL,
            consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
            consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
            version: 'wc/v3'
        });
    }

    async initializeSheets() {
        const client = await this.auth.getClient();
        return google.sheets({ version: 'v4', auth: client });
    }

    // Add the missing fetchFirstOrder method
    async fetchFirstOrder(range) {
        const sheets = await this.initializeSheets();
        try {
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range,
            });
            return response.data.values ? response.data.values[0] : null;
        } catch (error) {
            console.error('Error fetching first order:', error.message);
            throw error;
        }
    }

    async fetchOrders(range = process.env.SHEET_RANGE) {
        const sheets = await this.initializeSheets();
        try {
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range,
            });
            return response.data.values || [];
        } catch (error) {
            console.error('Error fetching orders:', error.message);
            throw error;
        }
    }

    async updateOrderStatusInSheet(orderId, newStatus, rowIndex) {
        if (!orderStatuses.includes(newStatus)) {
            throw new Error(`Invalid status: ${newStatus}`);
        }

        const sheets = await this.initializeSheets();
        const range = rowIndex ? 
            `${process.env.SHEET_NAME}!C${rowIndex}` : 
            `${process.env.SHEET_NAME}!C2`;

        try {
            await sheets.spreadsheets.values.update({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range,
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [[newStatus]]
                }
            });

            updatedOrders.push({ id: orderId, status: newStatus });
            console.log(`Order ID ${orderId} status updated to "${newStatus}" in Google Sheets`);
            
            // Update WooCommerce after successful sheet update
            await this.updateWooCommerceStatus(orderId, newStatus);
        } catch (error) {
            console.error('Error updating order status in sheet:', error.message);
            throw error;
        }
    }

    async updateWooCommerceStatus(orderId, newStatus) {
        try {
            const status = newStatus.replace('wc-', '');
            const response = await this.api.put(`orders/${orderId}`, {
                status: status
            });
            console.log(`Order ${orderId} status updated in WooCommerce to ${status}`);
            return response.data;
        } catch (error) {
            console.error('Error updating WooCommerce status:', error.message);
            throw error;
        }
    }

    async updateDropdownOptions() {
        const sheets = await this.initializeSheets();
        
        try {
            const spreadsheet = await sheets.spreadsheets.get({
                spreadsheetId: process.env.GOOGLE_SHEET_ID
            });
            
            const targetSheet = spreadsheet.data.sheets.find(
                sheet => sheet.properties.title === process.env.SHEET_NAME
            );

            if (!targetSheet) {
                throw new Error('Target sheet not found');
            }

            const dataValidationRule = {
                requests: [{
                    setDataValidation: {
                        range: {
                            sheetId: targetSheet.properties.sheetId,
                            startRowIndex: 1,
                            endRowIndex: 1000,
                            startColumnIndex: 2,
                            endColumnIndex: 3
                        },
                        rule: {
                            condition: {
                                type: 'ONE_OF_LIST',
                                values: orderStatuses.map(status => ({
                                    userEnteredValue: status
                                }))
                            },
                            strict: true,
                            showCustomUi: true
                        }
                    }
                }]
            };

            const response = await sheets.spreadsheets.batchUpdate({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                resource: dataValidationRule
            });

            console.log('Dropdown options updated successfully');
            return response.data;
        } catch (error) {
            console.error('Error updating dropdown options:', error.message);
            throw error;
        }
    }

    async setupTrigger() {
        const sheets = await this.initializeSheets();
        
        try {
            const response = await sheets.spreadsheets.get({
                spreadsheetId: process.env.GOOGLE_SHEET_ID
            });

            const targetSheet = response.data.sheets.find(
                sheet => sheet.properties.title === process.env.SHEET_NAME
            );

            if (!targetSheet) {
                throw new Error('Target sheet not found');
            }

            // Create an Apps Script trigger
            const script = {
                function: 'onEdit',
                deploymentId: process.env.APPS_SCRIPT_DEPLOYMENT_ID,
                triggerId: Date.now().toString()
            };

            const triggerResponse = await google.script('v1').projects.triggers.create({
                scriptId: process.env.APPS_SCRIPT_PROJECT_ID,
                resource: {
                    triggers: [{
                        eventType: 'onEdit',
                        spreadsheetId: process.env.GOOGLE_SHEET_ID,
                        sheetId: targetSheet.properties.sheetId,
                        ...script
                    }]
                }
            });

            console.log('Trigger setup completed');
            return triggerResponse.data;
        } catch (error) {
            console.error('Error setting up trigger:', error.message);
            throw error;
        }
    }

    async fetchOrderFromWooCommerce(orderId) {
        try {
            const response = await this.api.get(`orders/${orderId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching order from WooCommerce:', error.message);
            throw error;
        }
    }

    getRandomStatus() {
        return orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
    }
}

module.exports = {
    OrderStatusUpdater,
    updatedOrders
};