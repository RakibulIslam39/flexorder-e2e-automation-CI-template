import { chromium, FullConfig } from '@playwright/test';
import { credentialsManager } from '../config/credentials';

async function globalSetup(_config: FullConfig) {
  console.log('🔧 Setting up global test environment...');
  
  try {
    // Validate credentials
    const isValid = await credentialsManager.validateCredentials();
    if (!isValid) {
      console.warn('⚠️  Some credentials are missing or invalid. Tests may fail.');
    } else {
      console.log('✅ All credentials validated successfully');
    }

    // Optional: Store authentication state for reuse
    const browser = await chromium.launch();
    const context = await browser.newContext();
    
    // You can add global authentication here if needed
    // For example, login to WordPress admin once and reuse the session
    
    await context.storageState({ path: 'playwright/.auth/user.json' });
    await browser.close();
    
    console.log('✅ Global setup completed successfully');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    // Don't throw error to allow tests to continue
  }
}

export default globalSetup;
