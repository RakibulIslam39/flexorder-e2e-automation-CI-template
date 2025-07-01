const { expect } = require('@playwright/test');
const path = require('path');

class ReplacePluginPage {
    constructor(page) {
        this.page = page;
        this.pluginsLink = page.locator('a[class="wp-has-submenu wp-not-current-submenu menu-top menu-icon-plugins"] div[class="wp-menu-name"]');
        this.addNewPluginLink = page.locator('#wpbody-content').getByRole('link', { name: 'Add New Plugin' });
        this.uploadPluginButton = page.getByRole('button', { name: 'Upload Plugin' });
        this.pluginZipInput = page.getByRole('textbox', { name: 'Plugin zip file' });
        this.installNowButton = page.getByRole('button', { name: 'Install Now' });
        this.replaceCurrentButton = page.getByRole('link', { name: 'Replace current with uploaded' });
        this.installedPluginsLink = page.getByRole('link', { name: 'Installed Plugins' });
        this.pluginVersionText = page.getByText('Version 1.13.0 | By WC Order');
    }

    async navigateToAdminPanel() {
        await this.page.goto(process.env.ADMIN_PANEL_URL);
    }

    async uploadAndReplacePlugin() {
        await this.pluginsLink.click();
        await this.addNewPluginLink.click();
        await this.uploadPluginButton.click();

        const pluginPath = path.resolve(process.env.Replace_Plugin_Path);
        await this.pluginZipInput.setInputFiles(pluginPath);
        await this.installNowButton.click();

        // Wait for navigation to the replacement page
        await this.page.waitForURL(process.env.REPLACE_PLUGIN_URL);
        await this.replaceCurrentButton.click();
    }

    async verifyPluginInstalled() {
        await this.installedPluginsLink.click();
        await expect(this.pluginVersionText).toBeVisible();
    }
}

module.exports = { ReplacePluginPage };
