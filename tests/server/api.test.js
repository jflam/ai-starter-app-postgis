// Import required modules
import request from 'supertest';
import app from '../../src/server/simplified-server.js';

// Add Jest environment globals
/* global describe, it, expect, jest */

// Mock the database connection
jest.mock('../../src/server/db.js', () => {
  return {
    pool: {
      query: jest.fn().mockImplementation((query, params) => {
        // Return mock data based on the query
        if (query.includes('restaurants/nearby')) {
          return Promise.resolve({
            rows: [{
              id: 1,
              name: 'Test Restaurant',
              city: 'Seattle',
              cuisine_type: 'Pizza',
              location_geojson: JSON.stringify({
                type: 'Point',
                coordinates: [params[0], params[1]]
              }),
              distance_km: 0.5
            }]
          });
        } else {
          return Promise.resolve({
            rows: [{
              id: 1,
              name: 'Test Restaurant',
              city: 'Seattle',
              cuisine_type: 'Pizza',
              location_geojson: JSON.stringify({
                type: 'Point',
                coordinates: [-122.3321, 47.6062]
              }),
              now: new Date().toISOString()
            }]
          });
        }
      })
    }
  };
});

// Test the endpoints
describe('API Tests', () => {
  it('GET /api/health should return a 200 status code', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('time');
  });

  it('GET /api/restaurants should return an array of restaurants', async () => {
    const response = await request(app).get('/api/restaurants');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    
    const restaurant = response.body[0];
    expect(restaurant).toHaveProperty('id');
    expect(restaurant).toHaveProperty('name');
    expect(restaurant).toHaveProperty('location');
  });
  
  it('GET /api/restaurants/nearby should return nearby restaurants', async () => {
    const response = await request(app).get('/api/restaurants/nearby?lon=-122.3321&lat=47.6062&km=5');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    
    const restaurant = response.body[0];
    expect(restaurant).toHaveProperty('id');
    expect(restaurant).toHaveProperty('name');
    expect(restaurant).toHaveProperty('location');
    expect(restaurant).toHaveProperty('distance_km');
  });
});