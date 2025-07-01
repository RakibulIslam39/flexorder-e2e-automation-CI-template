const { expect } = require('@playwright/test');

class LoginPage {
    constructor(page) {
        this.page = page;
        this.usernameField = page.getByLabel('Username or Email Address');
        this.passwordField = page.getByLabel('Password', { exact: true });
        this.loginButton = page.getByRole('button', { name: 'Log In' });
        this.dashboardButton = page.locator("(//div[normalize-space()='Dashboard'])[1]");
    }

    async navigate() {
        await this.page.goto(process.env.URL);
    }

    async login() {
        await this.usernameField.fill(process.env.USER_NAME);
        await this.passwordField.fill(process.env.PASSWORD);
        await this.loginButton.click();

        await this.dashboardButton.click();
        await expect(this.page.locator("(//h1[normalize-space()='Dashboard'])[1]")).toBeVisible();
    }
}

module.exports = { LoginPage };
