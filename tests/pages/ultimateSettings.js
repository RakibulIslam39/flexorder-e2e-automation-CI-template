const { expect } = require('@playwright/test');

class OrderSyncSettingsPage {
    constructor(page) {
        this.page = page;

        this.orderSyncLink = page.locator('//div[normalize-space()="FlexOrder"]');
        this.settingsMenu = page.locator('#toplevel_page_osgsw-admin').getByRole('link', { name: 'Settings' });

        this.optionToggles = {
            syncCustomOrderStatus: page.locator('label').filter({ hasText: 'Sync Custom order status' }).locator('input[type="checkbox"]'),
            displayTotalItems: page.locator('label').filter({ hasText: 'Display Total Items' }).locator('input[type="checkbox"]'),
            syncProductSku: page.locator('label').filter({ hasText: 'Sync product SKU' }).locator('input[type="checkbox"]'),
            displayTotalPrice: page.locator('label').filter({ hasText: 'Display Total Price' }).locator('input[type="checkbox"]'),
            displayTotalDiscount: page.locator('label').filter({ hasText: 'Display Total Discount' }).locator('input[type="checkbox"]'),
            showIndividualProduct: page.locator('label').filter({ hasText: 'Show individual product' }).locator('input[type="checkbox"]'),
            displayBillingAddress: page.locator('label').filter({ hasText: 'Display Billing Address' }).locator('input[type="checkbox"]'),
            displayShippingAddress: page.locator('label').filter({ hasText: 'Display Shipping Address' }).locator('input[type="checkbox"]'),
            displayOrderDate: page.locator('label').filter({ hasText: 'Display Order Date' }).locator('input[type="checkbox"]'),
            displayPaymentMethod: page.locator('label').filter({ hasText: 'Display Payment Method' }).locator('input[type="checkbox"]'),
            displayCustomerNote: page.locator('label').filter({ hasText: 'Display Customer Note' }).locator('input[type="checkbox"]'),
            displayOrderNote: page.locator('label').filter({ hasText: 'Display Order Note' }).locator('input[type="checkbox"]'),
            displayOrderPlacement: page.locator('label').filter({ hasText: 'Display order placement' }).locator('input[type="checkbox"]'),
            displayOrderUrl: page.locator('label').filter({ hasText: 'Display Order URL' }).locator('input[type="checkbox"]'),
            syncOrderCustomFields: page.locator('label').filter({ hasText: 'Sync Order Custom Fields' }).locator('input[type="checkbox"]'),
        };

        this.removeAllItemsButton = page.locator('button[title="Remove all items"] span[aria-hidden="true"]');
        this.customFieldDropdown = page.locator('//span[@role="combobo"]');
        this.saveChangesButton = page.getByRole('button', { name: 'Save Changes' });

        this.successMessage = page.getByRole('heading', { name: 'Great, your settings are' });
    }

    async login(username, password) {
        await this.page.goto(process.env.URL);
        await this.page.getByLabel('Username or Email Address').fill(username);
        await this.page.getByLabel('Password').fill(password);
        await this.page.getByRole('button', { name: 'Log In' }).click();
    }

    async navigateToSettings() {
        await this.orderSyncLink.click();
        await this.settingsMenu.click();
        await this.page.waitForLoadState( 'domcontentloaded' );
        await this.page.locator("//li[contains(@class, 'ssgs-dashboard__nav-link')][a[contains(., 'Settings')]]").click();
    }

    async toggleOption(option) {
        await this.page.waitForLoadState('domcontentloaded');
        const toggleInput = this.optionToggles[option];
        const isChecked = await toggleInput.isChecked();

        if (isChecked) {
            await toggleInput.uncheck();
            await toggleInput.check();
        } else {
            await toggleInput.check();
        }
    }

    async clearCustomFields() {
        if (await this.removeAllItemsButton.count() > 0) {
            await this.removeAllItemsButton.click();
        }
    }

    async saveChanges() {
        await this.saveChangesButton.click();
    }

    async verifySuccessMessage() {
        await expect(this.successMessage).toBeVisible();
    }
}

module.exports = { OrderSyncSettingsPage };