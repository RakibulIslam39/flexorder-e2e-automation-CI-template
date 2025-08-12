const { expect } = require('@playwright/test');
const { credentialsManager } = require('../../config/credentials');

class LoginPage {
    constructor(page) {
        this.page = page;
        this.creds = credentialsManager.getWordPressCredentials();
        this.usernameField = page.getByLabel('Username or Email Address');
        this.passwordField = page.getByLabel('Password', { exact: true });
        this.loginButton = page.getByRole('button', { name: 'Log In' });
        this.dashboardTitle = page.getByRole('heading', { name: 'Dashboard' });
    }

    async navigate() {
        await this.page.goto(this.creds.url);
    }

    async login() {
        await this.usernameField.fill(this.creds.username);
        await this.passwordField.fill(this.creds.password);
        await Promise.all([
            this.page.waitForNavigation({ url: /wp-admin/ }),
            this.loginButton.click(),
        ]);
        await expect(this.dashboardTitle).toBeVisible();
    }
}

module.exports = { LoginPage };
