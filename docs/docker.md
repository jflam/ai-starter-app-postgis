# Docker Guide

This guide explains how to use Docker with this application for both development and production.

## Development Environment

The application includes a `docker-compose.yml` file for local development.

### Prerequisites

- Docker
- Docker Compose

### Starting the Development Environment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Database Only

If you want to run only the PostgreSQL/PostGIS database:

```bash
docker-compose up -d postgres
```

This is useful when you want to run the application locally but use a containerized database.

### Service Configuration

The development environment includes the following services:

#### postgres

- Image: `postgis/postgis:15-3.4`
- Ports: 5432 (accessible from host)
- Environment variables:
  - `POSTGRES_USER`: postgres
  - `POSTGRES_PASSWORD`: postgres
  - `POSTGRES_DB`: app_db
- Volumes: Data is persisted in a Docker volume

#### app

- Build: Uses the local Dockerfile
- Ports: 
  - 3001 (Express API)
  - 5173 (Vite dev server)
- Environment variables:
  - `DATABASE_URL`: postgres://postgres:postgres@postgres:5432/app_db
  - `NODE_ENV`: development
  - `PORT`: 3001
- Dependencies: Waits for postgres service to be healthy
- Command: Runs migrations, seed script, and starts the dev servers

### Docker Volume

The database data is stored in a Docker volume named `postgres_data`. This ensures data persists between container restarts.

## Production Environment

### Building the Production Image

```bash
docker build -t restaurant-app:latest .
```

The Dockerfile uses a multi-stage build:

1. **Build stage**:
   - Uses Node.js 20 Alpine image
   - Copies and installs dependencies
   - Builds the application

2. **Production stage**:
   - Uses Node.js 20 Alpine image
   - Copies only necessary files from the build stage
   - Sets up entry point script

### Running the Production Container

```bash
docker run -p 3001:3001 \
  -e DATABASE_URL=postgres://user:pass@host:5432/db \
  -e NODE_ENV=production \
  restaurant-app:latest
```

### Environment Variables

The following environment variables are required:

- `DATABASE_URL`: PostgreSQL connection string with PostGIS extension
- `NODE_ENV`: Set to 'production'
- `PORT`: (Optional) Port for the Express server (default: 3001)

### Entry Point

The container uses `scripts/entrypoint.sh` as its entry point, which:

1. Runs database migrations
2. Seeds the database (if needed)
3. Starts the server

## Docker Compose for Production

For production deployment with Docker Compose:

```yaml
version: '3.8'
services:
  postgres:
    image: postgis/postgis:15-3.4
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    image: ${DOCKER_REGISTRY}/restaurant-app:latest
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      - DATABASE_URL=postgres://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      - NODE_ENV=production
      - PORT=3001
    ports:
      - "${APP_PORT:-3001}:3001"
    restart: always
    networks:
      - app-network

networks:
  app-network:

volumes:
  postgres_data:
```

Save this to `docker-compose.prod.yml` and deploy with:

```bash
# Create .env file with required variables
echo "DB_USER=postgres" >> .env
echo "DB_PASSWORD=secure_password" >> .env
echo "DB_NAME=app_db" >> .env
echo "DOCKER_REGISTRY=ghcr.io/username" >> .env
echo "APP_PORT=3001" >> .env

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## GitHub Container Registry

The GitHub Actions workflow builds and pushes the Docker image to GitHub Container Registry:

```bash
# Pull the latest image
docker pull ghcr.io/username/restaurant-app:latest

# Run the container
docker run -p 3001:3001 \
  -e DATABASE_URL=postgres://user:pass@host:5432/db \
  -e NODE_ENV=production \
  ghcr.io/username/restaurant-app:latest
```

## Dockerfile Details

```Dockerfile
# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/migrations ./migrations
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/data ./data

RUN chmod +x ./scripts/entrypoint.sh
RUN chmod +x ./scripts/wait-for-it.sh

EXPOSE 3001

CMD ["./scripts/entrypoint.sh"]
```

## Health Checks

Both Docker Compose files include health checks for the PostgreSQL service:

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres"]
  interval: 10s
  timeout: 5s
  retries: 5
```

The app service depends on postgres with the `condition: service_healthy` configuration, ensuring the database is ready before starting the application.