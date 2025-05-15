import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Create a database connection pool
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export const pool = new Pool({
  connectionString,
  // For Docker environments, set more aggressive timeouts
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 10, // Set max pool size
});

// Add hook to capture connection errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Verify connection on startup
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(-1);
  } else {
    console.log('Database connection established');
  }
});

// Export the pool for use in other modules
export default pool;