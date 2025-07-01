import { defineConfig, devices } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load .env if present
dotenv.config({ path: path.resolve(__dirname, 'tests/utilities/.env') });

// Optionally load product data (uncomment if needed)
/*
let productData = {};
try {
  productData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'tests/utilities/productdata.json'), 'utf8'));
} catch (error) {
  console.error('Error reading or parsing productdata.json:', error);
  process.exit(1);
}
*/

export default defineConfig({
  testDir: './tests',
  timeout: 5 * 60 * 1000, // 5 minutes per test
  expect: {
    timeout: 2 * 60 * 1000, // 2 minutes for expect()
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/e2e-junit-results.xml' }],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8000',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    testIdAttribute: 'autocomplete',
    actionTimeout: 0,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    // You can add/remove projects for mobile or branded browsers as needed
    /*
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
    */
  ],
  // If you want to run a dev server before tests, uncomment and adjust below:
  /*
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:8000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  */
});