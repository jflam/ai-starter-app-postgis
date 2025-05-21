# Modern Spatial Data Web Application Starter App

A modern full-stack application starter app with spatial data capabilities built with:

- React with TypeScript for the frontend
- Vite 6 for fast development and optimized builds
- Express 5 (RC) for the backend API
- PostgreSQL 15 with PostGIS 3.4 for spatial data
- Docker setup for easy development and deployment

## Features

- SQL-first approach with node-pg-migrate for migrations
- Raw SQL queries using pg driver (no ORM)
- Leaflet for interactive maps
- Spatial queries with PostGIS:
  - Find restaurants within a specified radius
  - Calculate distances between points
  - Store and retrieve geographic coordinates
- Comprehensive testing setup with Vitest and Playwright
- Docker Compose configuration for local development
- Multi-stage Docker build for production

## Quick Start

```bash
# Clone the repository
git clone https://github.com/jflam/ai-starter-app-postgis.git
cd ai-starter-app-postgis

# Install dependencies
npm install

# Set up environment variables
# You will register and obtain a free Mapbox token otherwise the map will not render
# https://docs.mapbox.com/help/getting-started/access-tokens/

cp .env.example .env

# Start development servers (automatically starts database, runs migrations, and opens the browser)
npm run dev
```

> **Note:** The `npm run dev` command will automatically:
> - Start PostgreSQL and PostGIS with Docker
> - Wait for the database to be ready
> - Run migrations if needed
> - Start frontend and backend development servers
> - Open your default browser to the frontend application

## Database

The application uses PostgreSQL with the PostGIS extension for spatial data handling. This enables:

- Storing restaurant locations as geometric points using the POINT data type
- Querying restaurants within a certain distance of a location using ST_DWithin
- Calculating the distance between points using ST_Distance

Key SQL queries used in the application:

```sql
-- Find all restaurants within a 5km radius of a point
SELECT id, name, ST_Distance(location::geography, ST_MakePoint(-122.3321, 47.6062)::geography) / 1000 AS distance_km
FROM restaurants
WHERE ST_DWithin(location::geography, ST_MakePoint(-122.3321, 47.6062)::geography, 5000)
ORDER BY distance_km;
```

For more information on database setup and management, see [DATABASE.md](DATABASE.md).

## Directory Structure

```
project-root/
├── data/                      # Data files
│   └── table.csv              # Restaurant data
├── migrations/                # SQL migration files
│   ├── 001_init.sql           # Schema & GiST index
│   └── 002_seed_marker.sql    # Marks seed completion
├── scripts/                   # Utility scripts
│   ├── entrypoint.sh          # Docker entrypoint
│   ├── seed.ts                # CSV import script
│   └── wait-for-it.sh         # Service wait script
├── src/
│   ├── client/                # Frontend React application
│   │   ├── components/        # UI components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── pages/             # Page components
│   │   ├── services/          # API clients
│   │   ├── types/             # TypeScript definitions
│   │   └── utils/             # Utility functions
│   └── server/                # Backend Express application
│       ├── controllers/       # Request handlers
│       ├── db/                # Database utilities
│       │   └── postgis/       # PostGIS specific functions
│       ├── middleware/        # Express middleware
│       ├── routes/            # API routes
│       ├── types/             # TypeScript definitions
│       └── utils/             # Utility functions
├── tests/                     # Test files
│   ├── client/                # Frontend tests
│   └── server/                # Backend tests
├── .env.example               # Environment variables template
├── docker-compose.yml         # Docker services config
├── Dockerfile                 # Multi-stage Docker build
├── package.json               # Project dependencies
├── tsconfig.json              # TypeScript config (client)
└── tsconfig.server.json       # TypeScript config (server)
```

## Available Commands

```bash
# Development
npm run dev          # Start Docker database, both client and server, and open browser
npm run dev:client   # Start Vite dev server only
npm run dev:server   # Start Express server only

# Database
npm run migrate      # Run database migrations
npm run seed         # Seed the database with sample data

# Building
npm run build        # Build both client and server
npm run build:client # Build client only
npm run build:server # Build server only

# Testing
npm run test         # Run all unit and API tests
npm run test:client  # Run client tests
npm run test:server  # Run server tests
npm run test:e2e     # Run end-to-end tests

# Quality
npm run typecheck    # Run TypeScript type checking
npm run lint         # Run ESLint
```

## Technologies Used

### Backend
- Node.js 20 LTS
- Express 5.0.0-rc.1
- PostgreSQL 15.5
- PostGIS 3.4.2
- node-pg-migrate 7.x
- pg driver 8.x
- Zod for validation

### Frontend
- React 18
- Vite 6.0.0
- Leaflet for maps
- SWR for data fetching

### Testing
- Vitest 3.1.3 (unified test runner for client and server)
- Playwright 1.44.x (end-to-end tests)
- Testcontainers (database testing)

## Docker Support

The project includes Docker and Docker Compose configuration for both development and production environments.

### Development

```bash
# Start all services in development mode
docker-compose up -d

# View logs
docker-compose logs -f
```

### Production

```bash
# Build production image
docker build -t ai-starter-app-postgis:latest .

# Run container
docker run -p 3001:3001 -e DATABASE_URL=******host:5432/db ai-starter-app-postgis:latest
```

For detailed Docker setup instructions, container configurations, and production deployment options, see the [Docker Guide](docs/docker.md).

## License

MIT
