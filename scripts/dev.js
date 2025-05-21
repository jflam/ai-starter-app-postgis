#!/usr/bin/env node

/**
 * Development script that:
 * 1. Starts the PostgreSQL/PostGIS database using docker-compose
 * 2. Waits for the database to be ready
 * 3. Runs migrations if needed
 * 4. Starts the development servers
 * 5. Opens the browser to the frontend
 */

const { spawn, spawnSync, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Function to output colored log messages
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Function to check if Docker is running
function checkDocker() {
  try {
    execSync('docker info', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Function to run a command and return a promise
function runCommand(command, args, options = {}) {
  log(`Running: ${command} ${args.join(' ')}`, colors.cyan);
  
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { 
      stdio: options.stdio || 'inherit',
      ...options
    });
    
    if (options.timeout) {
      setTimeout(() => {
        proc.kill();
        reject(new Error(`Command timed out: ${command} ${args.join(' ')}`));
      }, options.timeout);
    }
    
    proc.on('close', (code) => {
      if (code === 0 || options.ignoreErrors) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}: ${command} ${args.join(' ')}`));
      }
    });
    
    proc.on('error', (err) => {
      reject(err);
    });
  });
}

// Start the database using docker-compose
async function startDatabase() {
  log('Starting PostgreSQL/PostGIS database...', colors.green);
  
  // Check if Docker is running
  if (!checkDocker()) {
    log('Docker does not appear to be running. Please start Docker and try again.', colors.yellow);
    process.exit(1);
  }
  
  try {
    // Try to start the database using docker-compose
    await runCommand('docker-compose', ['up', '-d', 'postgres']);
    log('Database container started successfully', colors.green);
  } catch (error) {
    log(`Failed to start database container: ${error.message}`, colors.yellow);
    process.exit(1);
  }
}

// Wait for the database to be ready
async function waitForDatabase() {
  log('Waiting for the database to be ready...', colors.blue);
  
  try {
    // Use wait-for-it.sh script to wait for the PostgreSQL server
    const waitScript = path.join(__dirname, 'wait-for-it.sh');
    
    // Ensure the script is executable
    fs.chmodSync(waitScript, '755');
    
    // Run the script with a timeout
    await runCommand(waitScript, ['localhost:5432', '--', 'echo', 'Database is ready']);
    log('Database is ready!', colors.green);
  } catch (error) {
    log(`Database did not become ready: ${error.message}`, colors.yellow);
    process.exit(1);
  }
}

// Check database and run migrations if needed
async function setupDatabase() {
  try {
    // Set the correct DATABASE_URL for local development
    const localDbUrl = "postgres://postgres:postgres@localhost:5432/app_db";
    log(`Using database URL: ${localDbUrl}`, colors.blue);
    
    // Set environment variable for child processes
    const dbEnv = { ...process.env, DATABASE_URL: localDbUrl };
    
    // Check database connection
    await runCommand('node', [path.join(__dirname, 'check-db.js')], { env: dbEnv });
    
    // Run migrations
    log('Running database migrations...', colors.blue);
    await runCommand('npm', ['run', 'migrate'], { env: dbEnv });
    
    log('Database is set up and ready to go!', colors.green);
  } catch (error) {
    log(`Database setup error: ${error.message}`, colors.yellow);
    process.exit(1);
  }
}

// Main function
async function main() {
  try {
    // Banner
    log('\n=== Starting Development Environment ===\n', colors.magenta);
    
    // Start the database
    await startDatabase();
    
    // Wait for the database to be ready
    await waitForDatabase();
    
    // Setup the database
    await setupDatabase();
    
    // Start the development servers with browser opening enabled
    log('\nStarting development servers...', colors.blue);
    log('Frontend will be available at: http://localhost:5173', colors.green);
    log('Backend API will be available at: http://localhost:3001/api', colors.green);
    log('\nPress Ctrl+C to stop the development servers\n', colors.yellow);
    
    // Use the existing dev script, but with browser opening enabled for Vite
    process.env.BROWSER = 'true'; // Ensure the browser opens
    const dev = spawn('concurrently', ['"npm run dev:client -- --open"', '"npm run dev:server"'], { 
      stdio: 'inherit',
      shell: true,
      env: { ...process.env }
    });
    
    // Handle exit
    process.on('SIGINT', () => {
      log('\nShutting down development servers...', colors.yellow);
      dev.kill('SIGINT');
    });
    
    // Forward child process exit
    dev.on('exit', (code) => {
      process.exit(code);
    });
  } catch (error) {
    log(`Error: ${error.message}`, colors.yellow);
    process.exit(1);
  }
}

// Run the main function
main().catch(err => {
  log(`Unhandled error: ${err.message}`, colors.yellow);
  process.exit(1);
});
