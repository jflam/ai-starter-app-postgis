# PostGIS Integration Guide

This guide explains how PostGIS is integrated into the application for spatial data handling.

## Overview

PostGIS is a spatial database extension for PostgreSQL that adds support for geographic objects and enables location queries to be run in SQL. This application uses PostGIS for:

- Storing restaurant locations as geometric points
- Finding restaurants within a certain distance of a location
- Calculating distances between points
- Spatial indexing for efficient queries

## Database Setup

PostGIS is enabled in the database via the migration file `001_init.sql`:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE TABLE restaurants (
  id            SERIAL PRIMARY KEY,
  rank          INT    UNIQUE NOT NULL,
  name          TEXT   NOT NULL,
  city          TEXT   NOT NULL,
  address       TEXT   NOT NULL,
  cuisine_type  TEXT   NOT NULL,
  specialty     TEXT   NOT NULL,
  yelp_rating   NUMERIC(2,1),
  price_range   TEXT,
  image_url     TEXT,
  location      geometry(Point, 4326)
);
CREATE INDEX restaurants_location_gix ON restaurants USING GIST (location);
```

Key points:
- The PostGIS extension is created if it doesn't exist
- The `location` column uses the `geometry(Point, 4326)` type
  - `Point` specifies that it stores points (x,y coordinates)
  - `4326` is the SRID (Spatial Reference ID) for the WGS84 coordinate system (standard for GPS/web mapping)
- A GiST spatial index is created for efficient spatial queries

## Working with PostGIS Data

### Storing Locations

When inserting data, PostGIS functions convert text or GeoJSON representations into the geometry data type:

```sql
-- From WKT (Well-Known Text)
INSERT INTO restaurants (name, location)
VALUES ('Restaurant Name', ST_SetSRID(ST_GeomFromText('POINT(-122.3 47.6)'), 4326));

-- From lon/lat coordinates
INSERT INTO restaurants (name, location)
VALUES ('Restaurant Name', ST_SetSRID(ST_MakePoint(-122.3, 47.6), 4326));
```

The seed script in `scripts/seed.ts` uses this approach to import restaurant data:

```typescript
const text = `INSERT INTO restaurants
  (rank,name,city,address,cuisine_type,specialty,yelp_rating,price_range,image_url,location)
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,ST_SetSRID(ST_GeomFromText($10),4326))`;
```

### Querying Nearby Locations

To find restaurants within a certain distance, the application uses PostGIS functions:

```sql
SELECT id, name,
  ST_Distance(location::geography, ST_MakePoint($1,$2)::geography) AS meters
FROM restaurants
WHERE ST_DWithin(location::geography, ST_MakePoint($1,$2)::geography, $3*1000)
ORDER BY meters;
```

Key functions:
- `ST_MakePoint(lon, lat)`: Creates a point from coordinates
- `ST_SetSRID(geometry, 4326)`: Assigns the WGS84 coordinate system
- `::geography`: Casts to geography type for distance calculations in meters
- `ST_DWithin(geog1, geog2, distance)`: Filters points within the given distance
- `ST_Distance(geog1, geog2)`: Calculates the distance between points

### Returning GeoJSON

To return location data as GeoJSON for frontend use:

```sql
SELECT id, name, ST_AsGeoJSON(location) as location_geojson
FROM restaurants;
```

The controller then parses this into a JavaScript object:

```typescript
const results = rows.map(row => ({
  ...row,
  location: JSON.parse(row.location_geojson),
  location_geojson: undefined
}));
```

## Best Practices

1. **Always use SRID 4326 for web mapping**
   - WGS84 is the standard coordinate system for web mapping and GPS
   - Always use `ST_SetSRID` with 4326 when creating points

2. **Use geography type for distance calculations**
   - Cast geometry to geography with `::geography` for accurate distance measurements in meters
   - Without this cast, distances would be in degrees, not meters

3. **Use spatial indices for performance**
   - Always create a GiST index on geometry columns
   - Queries using `ST_DWithin` will use this index for optimization

4. **Prefer ST_DWithin over manual distance filtering**
   - Using `WHERE ST_DWithin(...) ORDER BY ST_Distance(...)` is more efficient than calculating distances for all points

## Common PostGIS Functions

| Function | Description |
|----------|-------------|
| `ST_MakePoint(lon, lat)` | Creates a point from longitude and latitude |
| `ST_GeomFromText(wkt)` | Creates a geometry from WKT representation |
| `ST_SetSRID(geom, srid)` | Sets the SRID for a geometry |
| `ST_DWithin(g1, g2, dist)` | Returns true if g1 and g2 are within dist of each other |
| `ST_Distance(g1, g2)` | Returns the distance between g1 and g2 |
| `ST_AsGeoJSON(geom)` | Returns geometry as GeoJSON string |
| `ST_Contains(g1, g2)` | Returns true if g1 completely contains g2 |

## Frontend Integration with Leaflet

The frontend uses Leaflet to display PostGIS data on a map. Points from the database are converted to Leaflet markers:

```typescript
// PostGIS returns points as [longitude, latitude]
// Leaflet expects coordinates as [latitude, longitude]
const marker = L.marker([coords[1], coords[0]]);
```

Remember that PostGIS and GeoJSON use `[longitude, latitude]` order, while Leaflet uses `[latitude, longitude]` order. Always swap the coordinates when converting between them.