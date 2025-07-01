const { expect } = require('@playwright/test');

class SetupAddCredentialsPage {
    constructor(page) {
        this.page = page;
        this.orderSyncLink = page.locator('//div[normalize-space()="FlexOrder"]');
        this.setupButton = page.getByRole('button', { name: 'Start setup' });
        this.changeSetupButton = page.locator('//button[normalize-space()="Change setup"]');
        this.setCredentialsLink = page.getByRole('link', { name: 'Set Credentials' });
        this.uploadButton = page.getByText('Upload file');
        this.fileInput = page.getByLabel('Drag and drop the credential.');
        this.apiEnabledCheckbox = page.getByText('I’ve enabled Google Sheet API');
        this.nextButton = page.getByRole('button', { name: 'Next' });
        this.sheetUrlInput = page.getByPlaceholder('Enter your google sheet URL');
        this.sheetNameInput = page.getByPlaceholder('Enter your google sheet Name');
        this.copyButton = page.getByRole('button', { name: 'Copy' });
        this.editorAccessCheckbox = page.getByText('I\'ve given Editor access to');
        this.appScriptCheckbox = page.locator('//input[@id="place_code"]');
        this.triggerCheckbox = page.getByText('I’ve added the trigger and');
        this.syncLink = page.locator('//a[normalize-space()="Sync orders on Google Sheet"]');
        this.dashboardLink = page.getByRole('link', { name: 'Go to Dashboard' });
    }

    async navigateToPluginPage() {
        await this.orderSyncLink.click();
        await this.page.waitForNavigation({ waitUntil: 'domcontentloaded' });
        const setupButtonVisible = await this.setupButton.isVisible();
        const changeSetupButtonVisible = await this.changeSetupButton.isVisible();
    
        if (setupButtonVisible) {
            await this.setupButton.click();
            await this.setCredentialsLink.click();
        } else if (changeSetupButtonVisible) {
            await this.changeSetupButton.click();
            await this.setCredentialsLink.click();
        } else {
            await this.setCredentialsLink.click();
        }
    }

    async uploadFile() {
        await this.fileInput.setInputFiles(process.env.SERVICE_ACCOUNT_UPLOAD_FILE);
    }

    async completeSetup() {
        await this.apiEnabledCheckbox.check();
        await this.nextButton.click();
        await this.sheetUrlInput.fill(process.env.GOOGLE_SHEET_URL);
        await this.sheetNameInput.fill(process.env.SHEET_NAME);
        await this.nextButton.click();
        await this.copyButton.click();
        await this.editorAccessCheckbox.check();
        await this.nextButton.click();
        await this.copyButton.click();
        await this.appScriptCheckbox.check();
        await this.nextButton.click();
        await this.triggerCheckbox.check();
        await this.nextButton.click();
    }

    async finalizeSetup() {
        await this.syncLink.click();
        await expect(this.page.getByRole('heading', { name: 'Congratulations' })).toBeVisible();
        await this.dashboardLink.click();

    }
}

module.exports = { SetupAddCredentialsPage };
