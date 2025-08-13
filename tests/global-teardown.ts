import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalTeardown(_config: FullConfig) {
  console.log('🧹 Cleaning up global test environment...');
  
  try {
    // Clean up auth state file
    const authFile = path.join(process.cwd(), 'playwright', '.auth', 'user.json');
    if (fs.existsSync(authFile)) {
      fs.unlinkSync(authFile);
      console.log('✅ Auth state file cleaned up');
    }

    // Clean up any temporary directories
    const tempDirs = [
      path.join(process.cwd(), 'temp'),
      path.join(process.cwd(), 'tmp'),
      path.join(process.cwd(), 'playwright', '.auth')
    ];

    for (const dir of tempDirs) {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`✅ Cleaned up directory: ${dir}`);
      }
    }

    console.log('✅ Global teardown completed successfully');
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw error to allow process to complete
  }
}

export default globalTeardown;
