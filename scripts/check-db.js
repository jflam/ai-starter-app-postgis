// Simple script to check the database connection and tables
require('dotenv').config();
const { Pool } = require('pg');

async function checkDatabase() {
  // Create a connection pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/app_db'
  });

  try {
    // Check connection
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection successful, current time:', result.rows[0].now);

    // Check if restaurants table exists
    try {
      const tableCheck = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema='public' 
        AND table_name='restaurants'
      `);
      
      if (tableCheck.rows.length > 0) {
        console.log('Restaurants table exists');
        
        // Count rows in restaurants table
        const countResult = await pool.query('SELECT COUNT(*) FROM restaurants');
        console.log(`Restaurants table has ${countResult.rows[0].count} rows`);
        
        // PostGIS check
        try {
          const postgisCheck = await pool.query(`
            SELECT PostGIS_Version();
          `);
          console.log('PostGIS version:', postgisCheck.rows[0].postgis_version);
        } catch (error) {
          console.error('PostGIS extension is not installed:', error.message);
        }
        
        // Check for spatial data
        try {
          const spatialCheck = await pool.query(`
            SELECT id, name, ST_AsText(location) as wkt_geom
            FROM restaurants
            LIMIT 3;
          `);
          console.log('Sample spatial data:');
          spatialCheck.rows.forEach(row => {
            console.log(` - ${row.id}: ${row.name} at ${row.wkt_geom}`);
          });
        } catch (error) {
          console.error('Error querying spatial data:', error.message);
        }
      } else {
        console.log('Restaurants table does not exist - you may need to run migrations');
      }
    } catch (error) {
      console.error('Error checking tables:', error.message);
    }
  } catch (error) {
    console.error('Database connection failed:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the check
checkDatabase()
  .then(() => console.log('Database check complete'))
  .catch(err => console.error('Error during database check:', err));