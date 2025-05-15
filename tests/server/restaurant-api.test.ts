import request from 'supertest';
import app from '../../src/server/index';
import { startPg } from '../_setupDb';
import { PostgreSqlContainer } from 'testcontainers';

describe('Restaurant API', () => {
  let container: PostgreSqlContainer;

  beforeAll(async () => {
    // Start a dedicated PostgreSQL container for this test
    container = await startPg();
  }, 60000); // Increased timeout for container startup

  afterAll(async () => {
    // Stop the container after tests
    await container.stop();
  });

  describe('GET /api/restaurants', () => {
    it('should return all restaurants', async () => {
      const response = await request(app).get('/api/restaurants');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Check if the response has the expected structure
      const restaurant = response.body[0];
      expect(restaurant).toHaveProperty('id');
      expect(restaurant).toHaveProperty('name');
      expect(restaurant).toHaveProperty('cuisine_type');
      expect(restaurant).toHaveProperty('location');
      expect(restaurant.location).toHaveProperty('type', 'Point');
      expect(restaurant.location).toHaveProperty('coordinates');
      expect(Array.isArray(restaurant.location.coordinates)).toBe(true);
    });
  });

  describe('GET /api/restaurants/nearby', () => {
    it('should return nearby restaurants within the specified distance', async () => {
      // Test coordinates near Seattle
      const response = await request(app)
        .get('/api/restaurants/nearby')
        .query({ lon: -122.3321, lat: 47.6062, km: 10 });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // Verify that we have at least one result
      expect(response.body.length).toBeGreaterThan(0);
      
      // Check if the response has distance information
      const restaurant = response.body[0];
      expect(restaurant).toHaveProperty('distance_km');
      
      // Verify that restaurants are ordered by distance
      if (response.body.length > 1) {
        expect(restaurant.distance_km).toBeLessThanOrEqual(response.body[1].distance_km);
      }
    });

    it('should return 400 when parameters are invalid', async () => {
      const response = await request(app)
        .get('/api/restaurants/nearby')
        .query({ lon: 'invalid', lat: 47.6062, km: 10 });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });
  });

  describe('GET /api/restaurants/:id', () => {
    it('should return a specific restaurant by ID', async () => {
      // First get all restaurants to find an ID
      const allResponse = await request(app).get('/api/restaurants');
      const id = allResponse.body[0].id;
      
      // Then fetch the specific restaurant
      const response = await request(app).get(`/api/restaurants/${id}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', id);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('location');
    });

    it('should return 404 for non-existent restaurant', async () => {
      const response = await request(app).get('/api/restaurants/9999');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
    });
  });
});