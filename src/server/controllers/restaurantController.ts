import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { pool } from '../db';
import { logger } from '../utils/logger';

// Validation schema for nearby query
const nearbySchema = z.object({
  lon: z.coerce.number(),
  lat: z.coerce.number(),
  km: z.coerce.number().default(5)
});

// Get restaurants nearby a point
export async function nearby(req: Request, res: Response, next: NextFunction) {
  try {
    // Validate and extract query parameters
    const { lon, lat, km } = nearbySchema.parse(req.query);
    
    // Execute query with PostGIS distance calculation
    const { rows } = await pool.query(
      `SELECT 
        id,
        name,
        city,
        address,
        cuisine_type,
        specialty,
        yelp_rating,
        price_range,
        image_url,
        ST_AsGeoJSON(location) as location_geojson,
        ST_Distance(location::geography, ST_MakePoint($1,$2)::geography) AS meters
       FROM restaurants
       WHERE ST_DWithin(location::geography, ST_MakePoint($1,$2)::geography, $3*1000)
       ORDER BY meters`,
      [lon, lat, km]
    );
    
    // Transform the results to include GeoJSON
    const results = rows.map(row => ({
      ...row,
      location: JSON.parse(row.location_geojson),
      distance_km: parseFloat((row.meters / 1000).toFixed(2)),
      meters: undefined,
      location_geojson: undefined
    }));
    
    res.json(results);
  } catch (err) {
    next(err);
  }
}

// Get all restaurants
export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const { rows } = await pool.query(
      `SELECT 
        id, 
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
       ORDER BY rank`
    );
    
    // Transform the results to include GeoJSON
    const results = rows.map(row => ({
      ...row,
      location: JSON.parse(row.location_geojson),
      location_geojson: undefined
    }));
    
    res.json(results);
  } catch (err) {
    next(err);
  }
}

// Get restaurant by ID
export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    
    const { rows } = await pool.query(
      `SELECT 
        id, 
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
       WHERE id = $1`,
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        error: { 
          code: 'NOT_FOUND', 
          message: 'Restaurant not found' 
        } 
      });
    }
    
    // Transform the result to include GeoJSON
    const result = {
      ...rows[0],
      location: JSON.parse(rows[0].location_geojson),
      location_geojson: undefined
    };
    
    res.json(result);
  } catch (err) {
    next(err);
  }
}