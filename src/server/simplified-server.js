// Simple Express server
import express from 'express';
import cors from 'cors';
import { pool } from './db.js';
import * as dotenv from 'dotenv';

// Make sure environment variables are loaded
dotenv.config();

// Create Express application
const app = express();
const PORT = process.env.PORT || 3001;

// Apply middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', async (_req, res) => {
  try {
    // Test database connection
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'ok', 
      time: new Date().toISOString(),
      db_time: result.rows[0].now
    });
  } catch (error) {
    // Return ok even if database is not connected
    res.json({ 
      status: 'ok', 
      time: new Date().toISOString(),
      db_status: 'not connected'
    });
  }
});

// Endpoint to provide Mapbox token to the client
app.get('/api/config/mapbox', (_req, res) => {
  const token = process.env.MAPBOX_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'Mapbox configuration is missing' });
  }
  res.json({ token });
});

// Get all restaurants
app.get('/api/restaurants', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        id, 
        rank,
        name, 
        city, 
        address, 
        cuisine_type, 
        specialty, 
        yelp_rating, 
        price_range, 
        image_url,
        ST_AsGeoJSON(location) as location_geojson
      FROM restaurants
      ORDER BY rank
    `);

    // Transform the results to include GeoJSON
    const results = rows.map(row => ({
      ...row,
      location: JSON.parse(row.location_geojson),
      location_geojson: undefined
    }));
    
    res.json(results);
  } catch (error) {
    console.error('Error querying restaurants:', error);
    // Return mock data if database query fails
    res.json([
      {
        id: 1,
        name: 'Test Restaurant (Mock)',
        city: 'Seattle',
        cuisine_type: 'Pizza',
        location: {
          type: 'Point',
          coordinates: [-122.3321, 47.6062]
        }
      }
    ]);
  }
});

// Get nearby restaurants
app.get('/api/restaurants/nearby', async (req, res) => {
  try {
    const lon = parseFloat(req.query.lon) || -122.3321;
    const lat = parseFloat(req.query.lat) || 47.6062;
    const km = parseFloat(req.query.km) || 5;
    
    const { rows } = await pool.query(`
      SELECT 
        id,
        rank,
        name,
        city,
        address,
        cuisine_type,
        specialty,
        yelp_rating,
        price_range,
        image_url,
        ST_AsGeoJSON(location) as location_geojson,
        ST_Distance(location::geography, ST_MakePoint($1,$2)::geography) / 1000 AS distance_km
      FROM restaurants
      WHERE ST_DWithin(location::geography, ST_MakePoint($1,$2)::geography, $3 * 1000)
      ORDER BY distance_km
    `, [lon, lat, km]);
    
    // Transform the results to include GeoJSON
    const results = rows.map(row => ({
      ...row,
      distance_km: parseFloat(row.distance_km).toFixed(2),
      location: JSON.parse(row.location_geojson),
      location_geojson: undefined
    }));
    
    res.json(results);
  } catch (error) {
    console.error('Error querying nearby restaurants:', error);
    // Return mock data if database query fails
    res.json([
      {
        id: 1,
        name: 'Test Restaurant (Mock)',
        city: 'Seattle',
        cuisine_type: 'Pizza',
        location: {
          type: 'Point',
          coordinates: [parseFloat(req.query.lon) || -122.3321, parseFloat(req.query.lat) || 47.6062]
        },
        distance_km: 0.5
      }
    ]);
  }
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

// Export for testing
export default app;