import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

// Create a database connection pool
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('DATABASE_URL environment variable is not set, using default connection');
}

export const pool = new Pool({
  connectionString: connectionString || 'postgres://postgres:postgres@localhost:5432/app_db',
  // For Docker environments, set more aggressive timeouts
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 10, // Set max pool size
});

// Add hook to capture connection errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Don't crash the app in development mode
  if (process.env.NODE_ENV === 'production') {
    process.exit(-1);
  }
});

// Verify connection on startup
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('Database connection failed:', err);
    console.error('Will continue with mock data');
  } else {
    console.log('Database connection established');
  }
});

// Export the pool for use in other modules
export default pool;