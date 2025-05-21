#!/usr/bin/env node

/**
 * Script to run migrations and seed for testing
 * This ensures the database is properly prepared before running tests
 */

const { spawnSync } = require('child_process');
const path = require('path');

// Load the project's dotenv module
require(path.join(process.cwd(), 'node_modules', 'dotenv')).config({ path: '.env.test' });

console.log('Setting up test database...');
console.log(`Using database URL: ${process.env.DATABASE_URL}`);

// Run migrations
console.log('Running database migrations...');
const migrateResult = spawnSync('npm', ['run', 'migrate'], { 
  stdio: 'inherit',
  env: process.env
});

if (migrateResult.status !== 0) {
  console.error('Migration failed');
  process.exit(1);
}

// Run seed script
console.log('Running database seeding...');
const seedResult = spawnSync('npm', ['run', 'seed'], { 
  stdio: 'inherit',
  env: process.env
});

if (seedResult.status !== 0) {
  console.error('Seeding failed');
  process.exit(1);
}

console.log('Test database setup complete');