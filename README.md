# React 19 + Vite 6 + Express 5 + PostgreSQL 15/PostGIS 3.4 Starter App

A modern full-stack application template with spatial data capabilities built with:

- React 19 (RC) with TypeScript for the frontend
- Vite 6 for fast development and optimized builds
- Express 5 (RC) for the backend API
- PostgreSQL 15 with PostGIS 3.4 for spatial data
- Docker setup for easy development and deployment

## Features

- SQL-first approach with node-pg-migrate for migrations
- Raw SQL queries using pg driver (no ORM)
- Leaflet for interactive maps
- Spatial queries with PostGIS
- Comprehensive testing setup with Vitest, Jest, and Playwright
- Docker Compose configuration for local development
- Multi-stage Docker build for production

## Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-starter-app-postgis.git
cd ai-starter-app-postgis

# Install dependencies
npm install

# Start PostgreSQL and PostGIS with Docker
docker-compose up -d postgres

# Set up environment variables
cp .env.example .env

# Run migrations
npm run migrate

# Seed the database
npm run seed

# Start development servers (both frontend and backend)
npm run dev
```

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
npm run dev          # Start both client and server
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
npm run test         # Run all tests
npm run test:unit    # Run unit tests
npm run test:api     # Run API tests
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
- node-pg-migrate 8.x
- pg driver 8.x
- Zod for validation

### Frontend
- React 19 RC
- Vite 6.0.0
- Leaflet for maps
- SWR for data fetching

### Testing
- Vitest 3.0.0
- Jest 30.x
- Playwright 1.44.x
- Testcontainers

## Docker Support

The project includes Docker and Docker Compose configuration for both development and production.

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
docker run -p 3001:3001 -e DATABASE_URL=postgres://user:pass@host:5432/db ai-starter-app-postgis:latest
```

## License

MIT