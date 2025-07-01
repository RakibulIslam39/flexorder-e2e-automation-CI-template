const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/login');
const { SetupAddCredentialsPage } = require('../pages/setup');

test('Setup Add Credentials and Upload File Test', async ({ page }) => {
    
    const loginPage = new LoginPage(page);
    const setupPage = new SetupAddCredentialsPage(page);

    await loginPage.navigate();
    await loginPage.login();

    await setupPage.navigateToPluginPage();
    await setupPage.uploadFile();

    await setupPage.completeSetup();
    await setupPage.finalizeSetup();
    await expect(page.getByRole('heading', { name: 'Congratulations' })).toBeVisible();
});