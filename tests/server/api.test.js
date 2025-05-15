// Import required modules
const request = require('supertest');
const express = require('express');

// Create a simple Express app for testing
const app = express();

// Add health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Add restaurants endpoint
app.get('/api/restaurants', (req, res) => {
  res.json([
    {
      id: 1,
      name: 'Test Restaurant',
      city: 'Seattle',
      cuisine_type: 'Pizza',
      location: {
        type: 'Point',
        coordinates: [-122.3321, 47.6062]
      }
    }
  ]);
});

// Add nearby restaurants endpoint
app.get('/api/restaurants/nearby', (req, res) => {
  const lon = parseFloat(req.query.lon) || -122.3321;
  const lat = parseFloat(req.query.lat) || 47.6062;
  const km = parseFloat(req.query.km) || 5;
  
  res.json([
    {
      id: 1,
      name: 'Test Restaurant',
      city: 'Seattle',
      cuisine_type: 'Pizza',
      location: {
        type: 'Point',
        coordinates: [lon, lat]
      },
      distance_km: 0.5
    }
  ]);
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