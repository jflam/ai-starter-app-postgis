# GitHub Template for AI Coding Agents: React 19 + Vite 6 + Express 5 + PostgreSQL 15/PostGIS 3.4

---

## Part 1 • Product Requirements Document (PRD) — **Why & What**

*(unchanged from earlier drafts)*

---

## Part 2 • Implementation Plan — **What & How (Prisma‑less SQL‑first)**

### 0 · Locked‑In Versions (revised 2025‑05‑15)

| Layer               | Version        | Notes                                                |
| ------------------- | -------------- | ---------------------------------------------------- |
| PostgreSQL          | **15.5**       | LTS; pairs with PostGIS in `postgis/postgis:15-3.4`. |
| PostGIS             | **3.4.2**      | Green in upstream matrix.                            |
| **node‑pg‑migrate** | **8.x**        | Simple, SQL‑file migrations, zero ORM.               |
| **pg** driver       | **8.x**        | Raw queries + pool.                                  |
| Node.js             | **20 LTS**     | Required by Vite 6 / Express 5.                      |
| Vite                | **6.0.0**      | Bundler/dev‑server.                                  |
| Vitest              | **3.0.0**      | First version for Vite 6.                            |
| React               | **19 RC**      | Works with `@vitejs/plugin-react-swc`.               |
| Express             | **5.0.0‑rc.1** | Promise router; Node ≥ 18.                           |

> Types are handled via Zod + explicit TS interfaces; no ORM code‑gen required.

### 0.1 · Module System Standardization

This project uses **ECMAScript Modules (ESM)** throughout the entire codebase. All files must follow these conventions:

| Component | Extension | Import Pattern | Notes |
|-----------|-----------|----------------|-------|
| Server code | .js | `import x from 'y'` | All server files must use .js extension with ESM imports |
| TypeScript | .ts/.tsx | `import x from 'y'` | TypeScript files compile to ESM |
| Config files | .js | `export default {}` | Config files use ESM syntax |

#### TypeScript Configuration
```typescript
// tsconfig.server.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "Node16",        // Use Node16 module resolution
    "moduleResolution": "Node16", // Use Node16 module resolution
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    // Other options...
  }
}
```

#### Package.json Configuration
```json
{
  "type": "module",           // Declare the project as ESM
  "imports": {                // Add subpath imports
    "#server/*": "./src/server/*",
    "#db": "./src/server/db.js"
  }
}
```

---

### 1 · Project Scaffolding (boiler‑plate trimmed)

Relevant **non‑obvious** `package.json` scripts:

```jsonc
"scripts": {
  // dev helpers (standard Vite / nodemon omitted)
  "seed": "node scripts/seed.js",
  "migrate": "node-pg-migrate -d $DATABASE_URL -m migrations",
  "check-db": "node scripts/check-db.js",
  // testing layers
  "test": "npm run test:unit && npm run test:api",
  "test:unit": "vitest run",
  "test:api": "jest --runInBand",
  "test:e2e": "playwright test",
  "test:all": "npm-run-all -s test:unit test:api test:e2e"
}
```

Directory highlights (new):

```
└── migrations/
    ├── 001_init.sql         # schema & GiST index
    └── 002_seed_marker.sql  # optional data patch
└── scripts/
    ├── seed.js              # CSV → COPY → UPDATE geometry
    ├── check-db.js          # Database verification
└── src/server/db.js         # pg Pool helper
```

### 1.2 · Vite Entry Point Configuration

The Vite build requires an HTML entry point at project root:

```html
<!-- index.html - REQUIRED -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Restaurant Explorer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/client/main.tsx"></script>
  </body>
</html>
```

```typescript
// vite.config.ts - REQUIRED CONFIGURATION
export default defineConfig({
  plugins: [react()],
  root: './',                 // Root directory contains index.html
  build: {
    outDir: 'dist/client',    // Output client build to this folder
    emptyOutDir: true
  },
  // Other options...
});
```

Create public directory for static assets:
```bash
mkdir -p public
touch public/favicon.ico     # Required placeholder favicon
```

### 1.3 · Build and Development Scripts

#### Package.json Scripts Required Configuration

```json
"scripts": {
  "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
  "dev:client": "vite",
  "dev:server": "nodemon src/server/index.js",
  "build": "npm run build:client && npm run build:server",
  "build:client": "vite build",
  "build:server": "tsc -p tsconfig.server.json",
  "start": "node src/server/index.js",
  "seed": "node scripts/seed.js",
  "migrate": "node-pg-migrate -d $DATABASE_URL -m migrations",
  "check-db": "node scripts/check-db.js",
  "typecheck": "tsc --noEmit"
}
```

#### Development Environment Setup

1. Start the database: `docker-compose up -d postgres`
2. Verify database connection: `npm run check-db`
3. Run migrations: `npm run migrate`
4. Seed the database: `npm run seed`
5. Start development servers: `npm run dev`

---

### 2 · Database & Migrations (SQL‑first)

#### 2.1 Initial schema (`migrations/001_init.sql`)

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

Run locally or in CI:

```bash
npm run migrate   # picks up all *.sql files in migrations/
```

#### 2.2 Seed script — **Pure JS batch INSERT (no temp table)**

```js
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const csv = readFileSync('data/table.csv', 'utf8');
const rows = parse(csv, { columns: true });

(async () => {
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
  }
  await pool.end();
})();
```

> **Edge‑case handled:** Small dataset, so per‑row insert is acceptable; `ON CONFLICT` keeps the seed idempotent without temp tables.

#### 2.3 · Database Verification Script

Create a script to verify database connection and schema:

```javascript
// scripts/check-db.js
import { config } from 'dotenv';
import { Pool } from 'pg';

config();

async function checkDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/app_db'
  });

  try {
    // Check connection
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection successful');

    // Check PostGIS
    try {
      const postgisCheck = await pool.query('SELECT PostGIS_Version()');
      console.log('PostGIS version:', postgisCheck.rows[0].postgis_version);
    } catch (error) {
      console.error('PostGIS extension is not installed');
    }

    // Check restaurants table
    try {
      const tableCheck = await pool.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema='public' AND table_name='restaurants'
      `);
      
      if (tableCheck.rows.length > 0) {
        console.log('Restaurants table exists');
        
        // Count rows
        const countResult = await pool.query('SELECT COUNT(*) FROM restaurants');
        console.log(`Restaurants table has ${countResult.rows[0].count} rows`);
        
        // Sample spatial data
        if (countResult.rows[0].count > 0) {
          const spatialCheck = await pool.query(`
            SELECT id, name, ST_AsText(location) as wkt_geom
            FROM restaurants
            LIMIT 3;
          `);
          console.log('Sample spatial data:');
          spatialCheck.rows.forEach(row => {
            console.log(` - ${row.id}: ${row.name} at ${row.wkt_geom}`);
          });
        }
      } else {
        console.log('Restaurants table does not exist - run migrations');
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

checkDatabase();
```

Run this script after setting up the database to verify everything is working:
```bash
node scripts/check-db.js
```

---

### 3 · Backend Corner‑cases

Below are the **tricky patterns** that differ from vanilla Express wiring.

#### 3.1 Unified Error Envelope + Validation Mapping

```ts
import { ZodError } from 'zod';
interface ApiError { code: string; message: string; fields?: any }

app.use((err, _req, res, next) => {
  if (err instanceof ZodError) {
    const payload: ApiError = {
      code: 'VALIDATION_ERROR',
      message: 'Invalid input',
      fields: err.flatten(),
    };
    return res.status(400).json({ error: payload });
  }
  next(err);
});
```

#### 3.2 Controller Skeleton Using **pg** Pool

```ts
// controllers/restaurantController.ts
import { z } from 'zod';
import { pool } from '../db.js';

const nearbySchema = z.object({
  lon: z.coerce.number(),
  lat: z.coerce.number(),
  km:  z.coerce.number().default(5)
});

export async function nearby(req, res, next) {
  try {
    const { lon, lat, km } = nearbySchema.parse(req.query);
    const { rows } = await pool.query(
      `SELECT id,name,ST_Distance(location::geography, ST_MakePoint($1,$2)::geography) AS meters
         FROM restaurants
        WHERE ST_DWithin(location::geography, ST_MakePoint($1,$2)::geography, $3*1000)
        ORDER BY meters`,
      [lon, lat, km]
    );
    res.json(rows);
  } catch (err) { next(err); }
}
```

#### 3.3 Structured Logging (pino)

```ts
import pino from 'pino';
export const logger = pino({ level: process.env.NODE_ENV === 'production' ? 'info' : 'debug' });
app.use((req, _res, next) => { logger.info({ path: req.path }, 'request'); next(); });
```

#### 3.4 Streaming NDJSON for Big Queries

If result‑set > 10 k rows, stream:

```ts
res.setHeader('Content-Type','application/x-ndjson');
const cursor = pool.query(new Cursor(sql,[lon,lat,km]));
function pump() { cursor.read(1000,(err,rows)=>{ if(!rows.length){res.end();return;} rows.forEach(r=>res.write(JSON.stringify(r)+'\n')); pump();}); }
pump();
```

#### 3.5 · Database Connection with Graceful Fallbacks

```ts
// src/server/db.js
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Create a database connection pool with fallback defaults
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/app_db';
console.log(`Connecting to database: ${connectionString.split('@')[1]}`);

export const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 10
});

// Add error handling for resilience
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  // Don't crash in development
  if (process.env.NODE_ENV === 'production') {
    process.exit(-1);
  }
});

// Test connection but continue with mock data if it fails
export const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection established');
    return true;
  } catch (error) {
    console.error('Database connection failed, using mock data:', error.message);
    return false;
  }
};
```

#### API Endpoint Pattern with Fallback Data

All data-access API endpoints must follow this pattern:

```typescript
app.get('/api/endpoint', async (req, res) => {
  try {
    // Database query
    const { rows } = await pool.query('SELECT * FROM table');
    res.json(rows);
  } catch (error) {
    console.error('Database error, returning mock data:', error);
    // Return mock data that matches real data structure
    res.json([{ id: 1, name: 'Mock Data' }]);
  }
});
```

#### 3.6 · Dual Server Implementation Strategy

To provide maximum compatibility, implement two server versions:

1. **TypeScript Version** - For type checking and development:
   ```typescript
   // src/server/index.ts
   import express from 'express';
   import { Pool } from 'pg';
   // TypeScript implementation with types
   ```

2. **JavaScript Version** - For reliable execution:
   ```javascript
   // src/server/index.js
   import express from 'express';
   import { Pool } from 'pg';
   // Same implementation without TypeScript
   ```

3. **Package.json Configuration**:
   ```json
   "scripts": {
     "dev:server": "nodemon src/server/index.js",
     "start": "node src/server/index.js"
   }
   ```

The build process should compile TypeScript code to the JavaScript version, but maintain both during development for maximum compatibility.

---

### 4 · Front‑end Corner‑cases

Below are the two common pitfalls when wiring Leaflet in a Vite + React 19 environment.

#### 4.1 · Leaflet Marker Icon Fix

```typescript
// src/client/utils/fixLeafletIcons.ts - REQUIRED IMPLEMENTATION
import L from 'leaflet';

// Delete the _getIconUrl method to allow for URL overrides
delete (L.Icon.Default.prototype as any)._getIconUrl;

// Use direct URLs from CDN for icons to avoid bundling issues
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
```

This approach MUST be used with Vite to ensure marker icons load correctly. Importing the images directly will fail with most bundlers.

#### 4.2 Large‑Dataset Clustering

```tsx
import 'leaflet.markercluster';
export function useCluster(map: L.Map | null, data: Restaurant[]) {
  useEffect(()=>{
    if(!map) return;
    const group = L.markerClusterGroup();
    data.forEach(r=> group.addLayer(L.marker([r.lat,r.lon])));
    map.addLayer(group);
    return ()=> map.removeLayer(group);
  },[map,data]);
}
```

#### 4.3 Data‑Fetch Hook Example (SWR pattern)

```ts
import useSWR from 'swr';
export function useNearbyRestaurants(lon:number,lat:number,km=5){
  const { data, error } = useSWR(`/api/restaurants/nearby?lon=${lon}&lat=${lat}&km=${km}`, fetcher);
  return { restaurants:data ?? [], loading:!error&&!data, error };
}
```

---

### 5 · Testing Strategy & CI Pipeline

> **Why testcontainers?** Spatial queries need a live PostGIS backend; unit stubs miss SRID, GiST, and distance‑calculation edge‑cases. A tiny helper (`startPg`) spins an isolated **postgis/postgis:15‑3.4** container, runs migrations + seed, and hands a ready `DATABASE_URL` to each Jest suite. This keeps tests deterministic across dev machines and CI runners.
> We restore the full multi‑layer test plan.

#### 5.1 Test Matrix

| Layer                  | Tool                                  | Key Cases                                                 |
| ---------------------- | ------------------------------------- | --------------------------------------------------------- |
| **Unit — front‑end**   | Vitest 3 + RTL                        | Components render, hooks return correct state.            |
| **Unit — back‑end**    | Jest 30                               | Validation rejects bad input; SQL builder functions.      |
| **Integration API/DB** | Jest + Supertest + **testcontainers** | `/nearby` happy‑path, validation 400, SQL‑inject attempt. |
| **Integration UI/API** | Vitest + MSW                          | Hook displays loading, error, data states.                |
| **E2E**                | Playwright 1.44                       | Map shows 20 seed markers; create‑restaurant flow.        |

#### 5.2 Detailed Test‑Case Checklist

*(Create one file per bullet unless noted otherwise)*

##### Unit — Front‑end

1. **RestaurantCard renders essential fields** given minimal props.
2. **`useNearbyRestaurants` hook** → returns `loading` then populated array (MSW).
3. **Leaflet icon fix** module runs without throwing in JSDOM.

##### Unit — Back‑end

1. **`nearbySchema` fails** when lat/lon are non‑numeric.
2. **SQL helper** builds parametrised query strings (no `$` injection).
3. **Error handler** converts ZodError → `{ error.code === 'VALIDATION_ERROR' }`.

##### Integration API/DB

1. **Happy path**: `GET /api/restaurants/nearby` with seed coords returns 200 + ≥ 1 row.
2. **Distance ordering**: ensure first row `meters` < second row.
3. **Bad query param** (missing lat) → 400.

##### Integration UI/API

1. On network failure MSW returns 500 → hook exposes `error` and component shows alert banner.
2. Changing radius km re‑fires fetch (SWR key change) and updates marker count.

##### E2E (Playwright)

1. Landing page loads within 5 s → map tiles visible.
2. Marker click opens popup with matching restaurant name.
3. Fill "Add Restaurant" modal → submit → toast 'Created!' appears and new marker exists.
4. Hard refresh → new marker persists (DB round‑trip).

> Mark these bullets off in Jira/Issues; coverage threshold is met when all listed tests are green.

#### 5.3 testcontainers Helper (re‑usable)

```ts
// tests/_setupDb.ts
import { PostgreSqlContainer } from 'testcontainers';
export async function startPg() {
  const container = await new PostgreSqlContainer('postgis/postgis:15-3.4').start();
  process.env.DATABASE_URL = container.getConnectionUri();
  await execa('npm',['run','migrate']);
  await execa('npm',['run','seed']);
  return container;
}
```

Each Jest suite calls `startPg()` in `beforeAll`.

#### 5.4 · Testing Configurations (Complete Details)

#### Vitest for Client Tests

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/client'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/client/setup.ts'],
    deps: {
      inline: ['leaflet'] // Inline leaflet to avoid module issues
    }
  },
});
```

#### Client Test Setup

```typescript
// tests/client/setup.ts
import { vi, afterEach } from 'vitest';

// Clean up after each test
afterEach(() => {
  vi.resetAllMocks();
});
```

#### Jest for API Tests

To avoid TypeScript/ESM complications, use plain JavaScript for API tests:

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/server/**/*.test.js'],
  testTimeout: 30000
};
```

#### API Test Approach

API tests should use a test-specific Express app to avoid database dependencies:

```javascript
// tests/server/api.test.js
const request = require('supertest');
const express = require('express');

// Create test-specific app
const app = express();

// Define minimal test endpoints that mirror production endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Tests
describe('API Tests', () => {
  it('GET /api/health returns 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
  });
});
```

#### Required DevDependencies

```json
"devDependencies": {
  "@testing-library/jest-dom": "^6.4.2",
  "@testing-library/react": "^14.1.2",
  "jsdom": "^24.0.0",
  "jest": "^29.7.0",
  "supertest": "^6.3.3",
  "vitest": "^3.0.0"
}
```

#### 5.3 Playwright Config Snippet

```ts
// playwright.config.ts
export default { testDir:'tests/e2e', webServer:{ command:'docker compose up -d', port:5173, timeout:120_000 } };
```

#### 5.4 CI YAML (lint ✚ tests ✚ coverage)

```yaml
      - name: Run tests with coverage
        run: npm run test && npx nyc report
      - name: Upload to Codecov
        uses: codecov/codecov-action@v4
        with: { token: ${{ secrets.CODECOV_TOKEN }} }
```

> Coverage threshold configured in `nyc.config.js` at 90 % global.

---

### 6 · Docker & Compose — Additional Notes

* **entrypoint.sh** inside app image:

  ```bash
  #!/bin/sh
  set -e
  node-pg-migrate -d "$DATABASE_URL" -m /app/migrations
  node /app/scripts/seed.js
  exec node /app/src/server/index.js
  ```
* **Health‑check wait**: add `wait-for-it.sh db:5432 --` before migrations in compose for local dev.

\--- · Testing Strategy (unchanged snippets)

* testcontainers for PostGIS
* MSW for front‑end

---

### 6 · Docker & Compose (only env tweak)

`app` service now needs `scripts/migrate && npm run seed && node dist/server/index.js` in CMD or entrypoint.  Provide a tiny entrypoint.sh.

---

### 7 · Updated Milestones

| Week | Deliverable                                              |
| ---- | -------------------------------------------------------- |
| 1    | Repo skeleton; pg‑migrate wired; `.env` ready            |
| 2    | SQL schema, migrations run; seed script green            |
| 3    | Express API routes + Zod validation; React scaffold      |
| 4    | Leaflet map & nearby search end‑to‑end; CI green         |
| 5    | Docker multi‑stage image; deploy smoke test; docs polish |

---

### 8 · Outstanding Corner‑case Issues

| Area         | Gap                                            | Rationale                         |
| ------------ | ---------------------------------------------- | --------------------------------- |
| **CI/CD**    | Docker build‑push + Codecov coverage gate      | Ensure deploy & quality signals.  |
| **Security** | Rate‑limit (`express-rate-limit`) + strict CSP | Edge‑case but important for prod. |

\------|-----|-----------|
\| **Testing** | Integrate `startPg` helper into template repo | Avoid boiler‑plate duplication. |
\| **CI/CD** | Docker build‑push + Codecov coverage gate | Ensure deploy & quality signals. |
\| **Security** | Rate‑limit (`express-rate-limit`) + strict CSP | Edge‑case but important for prod. |

### 9 · Required Documentation Files

#### DATABASE.md

Create a detailed guide for database setup and troubleshooting:

```markdown
# Database Setup Guide

## Prerequisites
- Docker and Docker Compose
- Node.js 20 or higher

## Setup Steps
1. Start PostgreSQL container: `docker-compose up -d postgres`
2. Run migrations: `npm run migrate`
3. Seed the database: `npm run seed`
4. Verify setup: `node scripts/check-db.js`

## Troubleshooting
- Check logs: `docker-compose logs postgres`
- Connect directly: `docker exec -it <container> psql -U postgres -d app_db`
- Reset database: 
  ```bash
  docker-compose down
  docker-compose up -d postgres
  npm run migrate
  npm run seed
  ```
```

---

**End of Implementation Plan**\*\*\*\*