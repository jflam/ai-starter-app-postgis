# Instructions for AI Coding Assistants

## Project Overview

This is a full-stack application template with spatial data capabilities using:
- React 19 (RC) with Vite 6 for the frontend
- Express 5 (RC) for the backend API
- PostgreSQL 15 with PostGIS 3.4 for spatial database
- SQL-first approach (no ORM)
- Leaflet for interactive maps

## Common Commands

### Development
- `npm run dev` - Start both client and server
- `npm run dev:client` - Start Vite development server only
- `npm run dev:server` - Start Express server only
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint

### Database
- `npm run migrate` - Run database migrations (requires DATABASE_URL)
- `npm run seed` - Seed the database with sample data

### Building
- `npm run build` - Build both client and server
- `npm run build:client` - Build client only
- `npm run build:server` - Build server only

### Testing
- `npm run test` - Run all tests
- `npm run test:unit` - Run unit tests with Vitest
- `npm run test:api` - Run API tests with Jest
- `npm run test:e2e` - Run E2E tests with Playwright

## Important Files and Directories

- `/migrations/` - SQL migration files
- `/scripts/seed.ts` - Database seeding script
- `/src/server/db.ts` - PostgreSQL connection pool
- `/src/server/controllers/` - Express route controllers
- `/src/client/components/` - React components

## PostGIS Usage Patterns

When working with spatial data:

1. Always use `ST_SetSRID` with SRID 4326 (WGS84) for storing points:
   ```sql
   ST_SetSRID(ST_GeomFromText('POINT(-122.3 47.6)'), 4326)
   ```

2. For distance queries, cast to geography type:
   ```sql
   ST_Distance(
     location::geography,
     ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography
   ) AS meters
   ```

3. Use spatial indices for better performance:
   ```sql
   CREATE INDEX idx_spatial ON table USING GIST (column);
   ```

4. The standard pattern for nearby searches:
   ```sql
   SELECT id, name, 
     ST_Distance(location::geography, ST_MakePoint($1, $2)::geography) AS meters
   FROM table
   WHERE ST_DWithin(location::geography, ST_MakePoint($1, $2)::geography, $3)
   ORDER BY meters;
   ```

## Code Style Guidelines

- Use ES modules (import/export), not CommonJS (require)
- Use async/await for asynchronous operations
- Use TypeScript interfaces/types for type definitions
- Use Zod for input validation
- Prefer raw SQL with parameterized queries over query builders
- React components should be functional with hooks

## Project Structure Notes

- Frontend and backend are in the same monorepo
- `/src/client/` contains all frontend code
- `/src/server/` contains all backend code
- Vite handles frontend bundling
- TypeScript is compiled for the backend
- Tests are separated by frontend/backend

## Docker Tips

- Use `docker-compose up -d postgres` to start only the database
- The full `docker-compose up` command starts everything including migrations
- Database data is persisted in a Docker volume

## Common Pitfalls

- Remember to cast geometry to geography for distance calculations in meters
- The Leaflet marker icons need the special fix in the implementation plan
- Ensure proper CORS setup when testing the frontend against backend
- Make sure environment variables are properly set in .env file