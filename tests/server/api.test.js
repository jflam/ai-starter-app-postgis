// Import required modules
import request from 'supertest';
import app from '../../src/server/simplified-server.js';
import dotenv from 'dotenv';
import { pool } from '../../src/server/db.js';

// Add Jest environment globals
/* global describe, it, expect, beforeAll, afterAll */

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set up test database connection
beforeAll(async () => {
  // Verify database connection
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Test database connected:', result.rows[0].now);
  } catch (error) {
    console.error('Test database connection failed:', error);
  }
  
  // Wait a moment for the server to initialize
  await new Promise(resolve => setTimeout(resolve, 1000));
}, 10000);

afterAll(async () => {
  // Close database connection pool
  await pool.end();
});

// Test the endpoints
describe('API Tests', () => {
  it('GET /api/health should return a 200 status code', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('time');
    expect(response.body).toHaveProperty('db_time');
  });

  it('GET /api/restaurants should return an array of restaurants', async () => {
    const response = await request(app).get('/api/restaurants');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    
    // We should have 20 restaurants from the seed data
    expect(response.body.length).toBe(20);
    
    // Check the first restaurant (rank 1)
    const restaurant = response.body[0];
    expect(restaurant).toHaveProperty('id');
    expect(restaurant).toHaveProperty('name', 'Biang Biang Noodles');
    expect(restaurant).toHaveProperty('city', 'Seattle');
    expect(restaurant).toHaveProperty('cuisine_type', 'Chinese');
    expect(restaurant).toHaveProperty('specialty', 'Hand-pulled noodles');
    expect(restaurant).toHaveProperty('location');
    expect(restaurant.location).toHaveProperty('type', 'Point');
    expect(restaurant.location).toHaveProperty('coordinates');
    expect(restaurant.location.coordinates).toEqual([-122.32414, 47.613896]);
  });
  
  it('GET /api/restaurants/nearby should return nearby restaurants', async () => {
    // Use coordinates near downtown Seattle
    const response = await request(app).get('/api/restaurants/nearby?lon=-122.3321&lat=47.6062&km=5');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    
    // Should return multiple restaurants within 5km of downtown Seattle
    expect(response.body.length).toBeGreaterThan(0);
    
    // Check that each restaurant has the required properties
    response.body.forEach(restaurant => {
      expect(restaurant).toHaveProperty('id');
      expect(restaurant).toHaveProperty('name');
      expect(restaurant).toHaveProperty('city');
      expect(restaurant).toHaveProperty('location');
      expect(restaurant).toHaveProperty('distance_km');
      
      // Verify distance is a number and within range
      const distance = parseFloat(restaurant.distance_km);
      expect(distance).not.toBeNaN();
      expect(distance).toBeLessThanOrEqual(5);
    });
    
    // Verify restaurants are sorted by distance
    const distances = response.body.map(r => parseFloat(r.distance_km));
    const sortedDistances = [...distances].sort((a, b) => a - b);
    expect(distances).toEqual(sortedDistances);
  });
});