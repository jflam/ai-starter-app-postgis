import { FullConfig } from '@playwright/test';
import { execSync } from 'child_process';

async function globalSetup(_config: FullConfig) {
  console.log('Running database migrations before E2E tests...');
  
  try {
    // Run database migrations
    execSync('npm run migrate', { stdio: 'inherit' });
    
    // Run seed data
    execSync('npm run seed', { stdio: 'inherit' });
    
    console.log('Database migrations and seed completed successfully');
  } catch (error) {
    console.error('Error running database migrations:', error);
    throw error;
  }
}

export default globalSetup;