/* Centralized Credentials Management */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env from tests/utilities/.env if present, else from root .env
const envCandidates = [
  path.resolve(__dirname, '../tests/utilities/.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(process.cwd(), 'tests/utilities/.env'),
  path.resolve(process.cwd(), '.env'),
];
for (const p of envCandidates) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    break;
  }
}

class CredentialsManager {
  constructor() {
    this.wordpress = {
      url: process.env.URL || process.env.SITE_URL || 'http://localhost:8000',
      adminUrl: process.env.ADMIN_PANEL_URL || `${process.env.SITE_URL || 'http://localhost:8000'}/wp-admin`,
      username: process.env.USER_NAME || '',
      password: process.env.PASSWORD || '',
    };

    this.woocommerce = {
      baseUrl: process.env.SITE_URL || this.wordpress.url,
      consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY || '',
      consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET || '',
      apiVersion: 'wc/v3',
    };

    this.googleSheets = {
      sheetId: process.env.GOOGLE_SHEET_ID || '',
      sheetUrl: process.env.GOOGLE_SHEET_URL || '',
      scopes: process.env.GOOGLE_SHEET_SCOPES || 'https://www.googleapis.com/auth/spreadsheets',
      sheetName: process.env.SHEET_NAME || 'Sheet1',
      sheetRange: process.env.SHEET_RANGE || 'A1:D50',
      serviceAccountPath: process.env.SERVICE_ACCOUNT_UPLOAD_FILE || '',
    };
  }

  validateCredentials() {
    const required = [
      ['WOOCOMMERCE_CONSUMER_KEY', this.woocommerce.consumerKey],
      ['WOOCOMMERCE_CONSUMER_SECRET', this.woocommerce.consumerSecret],
      ['URL/SITE_URL', this.wordpress.url],
      ['USER_NAME', this.wordpress.username],
      ['PASSWORD', this.wordpress.password],
    ];
    const missing = required.filter(([, v]) => !v).map(([k]) => k);
    if (missing.length) {
      throw new Error(`Missing required credentials: ${missing.join(', ')}`);
    }
    return true;
  }

  getWordPressCredentials() {
    return { ...this.wordpress };
  }

  getWooCommerceConfig() {
    return { ...this.woocommerce };
  }

  getGoogleSheetsConfig() {
    const cfg = { ...this.googleSheets };
    let serviceAccountJson = null;
    if (cfg.serviceAccountPath) {
      const full = path.isAbsolute(cfg.serviceAccountPath)
        ? cfg.serviceAccountPath
        : path.resolve(process.cwd(), cfg.serviceAccountPath);
      if (fs.existsSync(full)) {
        serviceAccountJson = JSON.parse(fs.readFileSync(full, 'utf8'));
      }
    }
    return { ...cfg, serviceAccountJson };
  }
}

const credentialsManager = new CredentialsManager();
module.exports = { CredentialsManager, credentialsManager };

