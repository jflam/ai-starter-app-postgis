import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Create a new pool instance for this script
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const csv = readFileSync('data/table.csv', 'utf8');
const rows = parse(csv, { columns: true });

(async () => {
  try {
    console.log(`Starting seed process with ${rows.length} restaurants...`);
    
    const text = `INSERT INTO restaurants
      (rank,name,city,address,cuisine_type,specialty,yelp_rating,price_range,image_url,location)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,ST_SetSRID(ST_GeomFromText($10),4326))
      ON CONFLICT (rank) DO UPDATE SET
        name=EXCLUDED.name,
        city=EXCLUDED.city,
        address=EXCLUDED.address`;

    for (const r of rows) {
      const params = [
        +r.Rank,
        r['Restaurant Name'],
        r.Location,
        r.Address,
        r['Cuisine Type'],
        r.Specialty,
        +r['Yelp Rating'],
        r['Price Range'],
        r.Image,
        r.Coordinates
      ];
      await pool.query(text, params);
      console.log(`Inserted restaurant: ${r['Restaurant Name']}`);
    }
    
    console.log('Seed process completed successfully');
  } catch (error) {
    console.error('Error during seed process:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await pool.end();
  }
})();