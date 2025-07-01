// import { test } from '@playwright/test';
// import { LoginPage } from '../pages/login';
// import { ReplacePluginPage } from '../pages/replacePlugin';

// test.describe('Replace Plugin Test Suite', () => {
//     test('Replace an existing plugin with a new upload', async ({ page }) => {
//         const loginPage = new LoginPage(page);
//         const replacePluginPage = new ReplacePluginPage(page);

//         // Step 1: Log in to the admin panel
//         await loginPage.navigate();
//         await loginPage.login();

//         // Step 2: Navigate to Plugins page and replace the plugin
//         await replacePluginPage.navigateToAdminPanel();
//         await replacePluginPage.uploadAndReplacePlugin();

//         // Step 3: Verify the plugin is successfully installed
//         await replacePluginPage.verifyPluginInstalled();
//     });
// });
