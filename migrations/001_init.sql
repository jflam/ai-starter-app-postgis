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