GitHub Template for AI Coding Agents- React + Vite + Express + PostgreSQL-PostGIS Implementation Specification.md

# GitHub Template for AI Coding Agents: React + Vite + Express + PostgreSQL with PostGIS

## 1. Introduction and Purpose

This GitHub template provides a structured foundation for AI coding agents to create modern web applications using a TypeScript-based stack. The template combines React with Vite for the frontend, Express for the backend API, and PostgreSQL with PostGIS for spatial data storage.

The purpose of this template is to:

- Provide a consistent, well-structured starting point for AI-generated applications
- Incorporate best practices for TypeScript development across frontend and backend
- Enable spatial data capabilities through PostGIS integration
- Streamline the development workflow with modern tooling
- Facilitate rapid application development by AI coding agents

## 2. Compatible Software Versions

Based on research, the following versions are known to work well together:

| Component  | Version  | Notes                                      |
| ---------- | -------- | ------------------------------------------ |
| React      | 19.x     | Latest major version as of 2025 [1]        |
| Vite       | 6.x      | Fast development server and build tool [1] |
| TypeScript | 5.x      | For type safety across the application     |
| Express    | 5.x      | For API development [2]                    |
| PostgreSQL | 15.x     | Database engine                            |
| PostGIS    | 3.4.x    | Spatial database extension for PostgreSQL  |
| Node.js    | 20.x LTS | Runtime environment                        |
| Vitest     | 3.x      | Testing framework for Vite projects [1]    |

## 3. Project Structure

```
project-root/
├── .github/                      # GitHub-specific files
│   ├── workflows/                # GitHub Actions workflows
│   │   ├── ci.yml                # Continuous Integration workflow
│   │   └── deploy.yml            # Deployment workflow
│   └── ISSUE_TEMPLATE/           # Templates for GitHub issues
├── .vscode/                      # VS Code configuration
├── config/                       # Configuration files
│   └── index.sample.ts           # Sample configuration template
├── prisma/                       # Database schema and migrations
│   ├── migrations/               # Database migrations
│   ├── schema.prisma             # Prisma schema definition
│   └── seed.ts                   # Database seeding script
├── src/
│   ├── client/                   # Frontend React application
│   │   ├── components/           # Reusable UI components
│   │   ├── hooks/                # Custom React hooks
│   │   ├── pages/                # Page components
│   │   ├── services/             # API service clients
│   │   ├── types/                # TypeScript type definitions
│   │   ├── utils/                # Utility functions
│   │   ├── App.tsx               # Main React component
│   │   ├── main.tsx              # Entry point
│   │   └── vite-env.d.ts         # Vite type declarations
│   ├── server/                   # Backend Express application
│   │   ├── controllers/          # Request handlers
│   │   ├── db/                   # Database connection and models
│   │   │   └── postgis/          # PostGIS specific utilities
│   │   ├── middleware/           # Express middleware
│   │   ├── routes/               # API route definitions
│   │   ├── services/             # Business logic
│   │   ├── types/                # TypeScript type definitions
│   │   ├── utils/                # Utility functions
│   │   └── index.ts              # Server entry point
├── tests/                        # Test files
│   ├── client/                   # Frontend tests
│   └── server/                   # Backend tests
├── .env.example                  # Example environment variables
├── .eslintrc.js                  # ESLint configuration
├── .gitignore                    # Git ignore file
├── .prettierrc                   # Prettier configuration
├── CLAUDE.md                     # Instructions for AI coding agents
├── docker-compose.yml            # Docker configuration
├── package.json                  # Project dependencies
├── README.md                     # Project documentation
├── tsconfig.json                 # TypeScript configuration
└── vite.config.ts                # Vite configuration
```

### Key Directories and Files Explained

- **`.github/`**: Contains GitHub-specific files for CI/CD workflows and issue templates to help AI agents manage the repository [3].
- **`config/`**: Configuration files for different environments (development, testing, production).
- **`prisma/`**: Contains database schema, migrations, and seed data using Prisma ORM.
- **`src/client/`**: Frontend React application built with Vite [4].
- **`src/server/`**: Backend Express application with controllers, routes, and services [4].
- **`src/server/db/postgis/`**: PostGIS-specific utilities for handling spatial data.
- **`tests/`**: Test files for both frontend and backend.
- **`CLAUDE.md`**: Special file that provides instructions and context for AI coding agents [3].
- **`docker-compose.yml`**: Docker configuration for local development environment.

## 4. Setup Instructions for Development Environment

### Prerequisites

- Node.js (v20.x LTS)
- npm or yarn
- Docker and Docker Compose (for PostgreSQL and PostGIS)
- Git

### Initial Setup

1. Clone the template repository:
   
   ```bash
   git clone https://github.com/username/react-express-postgis-template.git your-project-name
   cd your-project-name
   ```

2. Install dependencies:
   
   ```bash
   npm install
   ```

3. Set up environment variables:
   
   ```bash
   cp .env.example .env
   ```

4. Start the PostgreSQL and PostGIS services using Docker:
   
   ```bash
   docker-compose up -d
   ```

5. Initialize the database with Prisma:
   
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

6. Start the development server:
   
   ```bash
   npm run dev
   ```

This will start both the Vite development server for the frontend and the Express server for the backend.

## 5. Database Setup with PostgreSQL and PostGIS

### Docker Configuration

The `docker-compose.yml` file sets up PostgreSQL with PostGIS extension:

```yaml
version: '3.8'
services:
  postgres:
    image: postgis/postgis:15-3.4
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Prisma Schema with PostGIS

The Prisma schema (`prisma/schema.prisma`) includes configuration for PostgreSQL with PostGIS:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Example model with PostGIS Point type
model Location {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  // The geometry column will be handled separately since Prisma doesn't natively support PostGIS types
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### PostGIS Integration

Since Prisma doesn't natively support PostGIS types, we'll use raw SQL queries for spatial operations. Create a utility file at `src/server/db/postgis/geometry.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Interface for GeoJSON Point
interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

// Create a location with geometry
export async function createLocationWithGeometry(
  name: string,
  description: string | null,
  point: GeoJSONPoint
) {
  // First create the location record
  const location = await prisma.location.create({
    data: {
      name,
      description,
    },
  });

  // Then add the geometry using raw SQL
  await prisma.$executeRaw`
    UPDATE "Location"
    SET geometry = ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(point)}), 4326)
    WHERE id = ${location.id}
  `;

  return location;
}

// Get locations within a certain distance (in meters)
export async function getLocationsWithinDistance(
  longitude: number,
  latitude: number,
  distanceInMeters: number
) {
  const point = {
    type: 'Point',
    coordinates: [longitude, latitude],
  };

  // Use raw query to perform spatial search
  const locations = await prisma.$queryRaw`
    SELECT 
      id, 
      name, 
      description, 
      ST_AsGeoJSON(geometry) as geometry,
      ST_Distance(
        geometry, 
        ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(point)}), 4326)::geography
      ) as distance
    FROM "Location"
    WHERE ST_DWithin(
      geometry,
      ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(point)}), 4326)::geography,
      ${distanceInMeters}
    )
    ORDER BY distance
  `;

  return locations;
}
```

### Database Migration for PostGIS

Create a migration file to add the geometry column:

```sql
-- Add PostGIS extension if not exists
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add geometry column to Location table
ALTER TABLE "Location" ADD COLUMN geometry geometry(Point, 4326);

-- Create spatial index
CREATE INDEX location_geometry_idx ON "Location" USING GIST (geometry);
```

## 6. Frontend Architecture (React + Vite)

### Vite Configuration

The `vite.config.ts` file configures the Vite build tool:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/client'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

### React Application Structure

The React application follows a modular structure with components, pages, and services:

- **Components**: Reusable UI components
- **Pages**: Top-level page components
- **Services**: API client services for communicating with the backend
- **Hooks**: Custom React hooks for shared logic

### Example Map Component with PostGIS Data

Create a map component that displays locations from PostGIS:

```typescript
// src/client/components/LocationMap.tsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchNearbyLocations } from '../services/locationService';

interface Location {
  id: number;
  name: string;
  description: string | null;
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  distance: number;
}

const LocationMap: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    // Get user's current location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        setUserLocation([latitude, longitude]);

        // Fetch nearby locations from the API
        fetchNearbyLocations(longitude, latitude, 5000) // 5km radius
          .then(data => setLocations(data))
          .catch(error => console.error('Error fetching locations:', error));
      },
      (error) => {
        console.error('Error getting user location:', error);
        // Default to a fallback location
        setUserLocation([51.505, -0.09]); // London
      }
    );
  }, []);

  if (!userLocation) {
    return <div>Loading map...</div>;
  }

  return (
    <MapContainer 
      center={userLocation} 
      zoom={13} 
      style={{ height: '500px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* User location marker */}
      <Marker position={userLocation}>
        <Popup>You are here</Popup>
      </Marker>

      {/* Location markers */}
      {locations.map(location => (
        <Marker 
          key={location.id} 
          position={[location.geometry.coordinates[1], location.geometry.coordinates[0]]}
        >
          <Popup>
            <h3>{location.name}</h3>
            <p>{location.description}</p>
            <p>Distance: {(location.distance / 1000).toFixed(2)} km</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default LocationMap;
```

## 7. Backend Architecture (Express + TypeScript)

### Express Server Setup

The Express server is configured in `src/server/index.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { PrismaClient } from '@prisma/client';
import routes from './routes';

// Initialize Prisma client
export const prisma = new PrismaClient();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());

// API routes
app.use('/api', routes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});
```

### Controller Structure

Controllers handle the request/response logic:

```typescript
// src/server/controllers/locationController.ts
import { Request, Response } from 'express';
import { createLocationWithGeometry, getLocationsWithinDistance } from '../db/postgis/geometry';

export const createLocation = async (req: Request, res: Response) => {
  try {
    const { name, description, longitude, latitude } = req.body;

    const point = {
      type: 'Point' as const,
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
    };

    const location = await createLocationWithGeometry(name, description, point);

    res.status(201).json(location);
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).json({ error: 'Failed to create location' });
  }
};

export const getNearbyLocations = async (req: Request, res: Response) => {
  try {
    const { longitude, latitude, distance } = req.query;

    if (!longitude || !latitude || !distance) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const locations = await getLocationsWithinDistance(
      parseFloat(longitude as string),
      parseFloat(latitude as string),
      parseFloat(distance as string)
    );

    res.json(locations);
  } catch (error) {
    console.error('Error fetching nearby locations:', error);
    res.status(500).json({ error: 'Failed to fetch nearby locations' });
  }
};
```

### Route Structure

Routes define the API endpoints:

```typescript
// src/server/routes/index.ts
import { Router } from 'express';
import locationRoutes from './locationRoutes';

const router = Router();

router.use('/locations', locationRoutes);

export default router;

// src/server/routes/locationRoutes.ts
import { Router } from 'express';
import { createLocation, getNearbyLocations } from '../controllers/locationController';

const router = Router();

router.post('/', createLocation);
router.get('/nearby', getNearbyLocations);

export default router;
```

## 8. API Structure and Communication

### API Client Service

Create a service to communicate with the backend API:

```typescript
// src/client/services/locationService.ts
import axios from 'axios';

const API_URL = '/api';

export interface LocationInput {
  name: string;
  description?: string;
  longitude: number;
  latitude: number;
}

export interface Location {
  id: number;
  name: string;
  description: string | null;
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  distance?: number;
}

export const createLocation = async (location: LocationInput): Promise<Location> => {
  const response = await axios.post(`${API_URL}/locations`, location);
  return response.data;
};

export const fetchNearbyLocations = async (
  longitude: number,
  latitude: number,
  distance: number
): Promise<Location[]> => {
  const response = await axios.get(`${API_URL}/locations/nearby`, {
    params: { longitude, latitude, distance }
  });
  return response.data;
};
```

### API Documentation

Create an OpenAPI specification for the API:

```yaml
# src/server/openapi.yaml
openapi: 3.0.0
info:
  title: Location API
  version: 1.0.0
  description: API for managing locations with spatial data
paths:
  /api/locations:
    post:
      summary: Create a new location
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - name
                - longitude
                - latitude
              properties:
                name:
                  type: string
                description:
                  type: string
                longitude:
                  type: number
                latitude:
                  type: number
      responses:
        '201':
          description: Location created successfully
  /api/locations/nearby:
    get:
      summary: Get locations within a specified distance
      parameters:
        - name: longitude
          in: query
          required: true
          schema:
            type: number
        - name: latitude
          in: query
          required: true
          schema:
            type: number
        - name: distance
          in: query
          required: true
          description: Distance in meters
          schema:
            type: number
      responses:
        '200':
          description: List of nearby locations
```

## 9. PostGIS Integration for Storing Entity Locations

### Database Schema for Spatial Data

To properly support PostGIS in the database, we need to:

1. Enable the PostGIS extension
2. Create tables with geometry columns
3. Set up spatial indexes for efficient queries

Here's a migration script to set up the necessary PostGIS infrastructure:

```sql
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create tables with geometry columns
CREATE TABLE "Business" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add geometry column for business location
SELECT AddGeometryColumn('Business', 'location', 4326, 'POINT', 2);

-- Create spatial index
CREATE INDEX business_location_idx ON "Business" USING GIST (location);

-- Create table for people
CREATE TABLE "Person" (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add geometry column for person's current location
SELECT AddGeometryColumn('Person', 'current_location', 4326, 'POINT', 2);

-- Create spatial index
CREATE INDEX person_location_idx ON "Person" USING GIST (current_location);
```

### TypeORM Integration with PostGIS

For TypeORM users, here's how to define entities with PostGIS support [5]:

```typescript
// src/server/entities/Business.ts
import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('Business')
export class Business {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  website: string;

  @Index({ spatial: true })
  @Column({
    type: 'geometry',
    srid: 4326,
    nullable: true,
    spatialFeatureType: 'Point'
  })
  location: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### Inserting Spatial Data

To insert spatial data using TypeORM [6]:

```typescript
// src/server/services/businessService.ts
import { getRepository } from 'typeorm';
import { Business } from '../entities/Business';

interface BusinessInput {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  longitude: number;
  latitude: number;
}

export const createBusiness = async (data: BusinessInput): Promise<Business> => {
  const businessRepository = getRepository(Business);

  // Create GeoJSON point
  const point = {
    type: 'Point',
    coordinates: [data.longitude, data.latitude]
  };

  // Create business with location
  const result = await businessRepository
    .createQueryBuilder()
    .insert()
    .into(Business)
    .values({
      name: data.name,
      description: data.description,
      address: data.address,
      phone: data.phone,
      email: data.email,
      website: data.website,
    })
    .returning('*')
    .execute();

  const business = result.raw[0];

  // Update with location using ST_GeomFromGeoJSON
  await businessRepository
    .createQueryBuilder()
    .update()
    .set({
      location: () => `ST_GeomFromGeoJSON('${JSON.stringify(point)}')`,
    })
    .where('id = :id', { id: business.id })
    .execute();

  return business;
};
```

### Querying Spatial Data

To query spatial data:

```typescript
// src/server/services/businessService.ts
export const findBusinessesNearby = async (
  longitude: number,
  latitude: number,
  radiusInMeters: number
): Promise<Business[]> => {
  const businessRepository = getRepository(Business);

  // Create point for the search center
  const point = {
    type: 'Point',
    coordinates: [longitude, latitude]
  };

  // Query businesses within the radius
  const businesses = await businessRepository
    .createQueryBuilder('business')
    .select([
      'business.*',
      'ST_AsGeoJSON(business.location) as location_geojson',
      'ST_Distance(business.location, ST_SetSRID(ST_GeomFromGeoJSON(:point), 4326)::geography) as distance'
    ])
    .where('ST_DWithin(business.location, ST_SetSRID(ST_GeomFromGeoJSON(:point), 4326)::geography, :radius)')
    .orderBy('distance', 'ASC')
    .setParameters({
      point: JSON.stringify(point),
      radius: radiusInMeters
    })
    .getRawMany();

  // Transform the results
  return businesses.map(business => ({
    ...business,
    location: JSON.parse(business.location_geojson),
    distance: parseFloat(business.distance)
  }));
};
```

## 10. Testing Strategy

### Frontend Testing with Vitest

Vitest is used for testing the React components:

```typescript
// tests/client/components/LocationMap.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LocationMap from '../../../src/client/components/LocationMap';
import * as locationService from '../../../src/client/services/locationService';

// Mock the location service
vi.mock('../../../src/client/services/locationService', () => ({
  fetchNearbyLocations: vi.fn()
}));

// Mock the react-leaflet components
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="marker">{children}</div>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popup">{children}</div>
  )
}));

describe('LocationMap', () => {
  it('renders loading state initially', () => {
    // Mock geolocation
    const mockGeolocation = {
      getCurrentPosition: vi.fn()
    };
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation
    });

    render(<LocationMap />);
    expect(screen.getByText('Loading map...')).toBeInTheDocument();
  });

  // Add more tests...
});
```

### Backend Testing with Jest

Jest is used for testing the Express API:

```typescript
// tests/server/controllers/locationController.test.ts
import { Request, Response } from 'express';
import { createLocation, getNearbyLocations } from '../../../src/server/controllers/locationController';
import * as geometryService from '../../../src/server/db/postgis/geometry';

// Mock the geometry service
jest.mock('../../../src/server/db/postgis/geometry', () => ({
  createLocationWithGeometry: jest.fn(),
  getLocationsWithinDistance: jest.fn()
}));

describe('Location Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('createLocation', () => {
    it('should create a location successfully', async () => {
      // Setup
      mockRequest.body = {
        name: 'Test Location',
        description: 'A test location',
        longitude: 0,
        latitude: 0
      };

      const mockLocation = { id: 1, name: 'Test Location' };
      (geometryService.createLocationWithGeometry as jest.Mock).mockResolvedValue(mockLocation);

      // Execute
      await createLocation(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockLocation);
    });

    // Add more tests...
  });
});
```

### Integration Testing

Integration tests ensure that the frontend, backend, and database work together correctly:

```typescript
// tests/integration/location.test.ts
import request from 'supertest';
import { app } from '../../src/server';
import { prisma } from '../../src/server';

describe('Location API Integration', () => {
  beforeAll(async () => {
    // Setup test database
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS postgis`;
  });

  afterAll(async () => {
    // Clean up
    await prisma.$disconnect();
  });

  it('should create and retrieve a location', async () => {
    // Create a location
    const createResponse = await request(app)
      .post('/api/locations')
      .send({
        name: 'Test Location',
        description: 'A test location',
        longitude: -0.1278,
        latitude: 51.5074
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toHaveProperty('id');

    // Retrieve nearby locations
    const getResponse = await request(app)
      .get('/api/locations/nearby')
      .query({
        longitude: -0.1278,
        latitude: 51.5074,
        distance: 1000
      });

    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toBeInstanceOf(Array);
    expect(getResponse.body.length).toBeGreaterThan(0);
    expect(getResponse.body[0]).toHaveProperty('name', 'Test Location');
  });
});
```

## 11. Deployment Considerations

### Docker Deployment

A `Dockerfile` for production deployment:

```dockerfile
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

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
```

### Environment Variables

Production environment variables should be set for:

- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Set to 'production'
- `PORT`: Port for the Express server
- `VITE_API_URL`: URL for the API (for frontend)

### CI/CD Pipeline

GitHub Actions workflow for CI/CD:

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgis/postgis:15-3.4
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      # Add deployment steps here
```

## 12. GitHub Template-Specific Features

### Template Configuration

Configure the repository as a template in GitHub:

1. Go to the repository settings
2. Check "Template repository" under the "Template repository" section

### GitHub Workflows

Include GitHub Actions workflows for:

- Continuous Integration
- Automated testing
- Deployment
- Issue triage using AI [7]

### Issue and PR Templates

Create templates for issues and pull requests:

```markdown
# .github/ISSUE_TEMPLATE/feature_request.md
---
name: Feature request
about: Suggest an idea for this project
title: ''
labels: enhancement
assignees: ''
---

**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

### CLAUDE.md File

Create a `CLAUDE.md` file to provide instructions for AI coding agents [8]:

```markdown
# Instructions for AI Coding Agents

## Common Commands

- `npm run dev`: Start development servers for both frontend and backend
- `npm run build`: Build the project for production
- `npm run test`: Run all tests
- `npm run lint`: Run ESLint to check code quality
- `npm run format`: Format code with Prettier

## Project Structure

- Frontend: React + Vite in `src/client/`
- Backend: Express + TypeScript in `src/server/`
- Database: PostgreSQL with PostGIS

## Code Style Guidelines

- Use ES modules (import/export) syntax, not CommonJS (require)
- Use async/await for asynchronous operations
- Use TypeScript interfaces for type definitions
- Follow the existing component structure for React components

## PostGIS Integration

When working with spatial data:
1. Use the utility functions in `src/server/db/postgis/geometry.ts`
2. Store coordinates as [longitude, latitude] in GeoJSON format
3. Use SRID 4326 (WGS84) for all geometry columns
4. Create spatial indexes for performance

## Testing

- Write tests for all new features
- Use Vitest for frontend tests
- Use Jest for backend tests
```

## 13. Documentation Structure

### README.md

The main README.md file should include:

```markdown
# React + Vite + Express + PostgreSQL with PostGIS Template

A modern full-stack application template using React, Vite, Express, and PostgreSQL with PostGIS for spatial data.

## Features

- React 19 with TypeScript for the frontend
- Vite 6 for fast development and optimized builds
- Express 5 for the backend API
- PostgreSQL with PostGIS for spatial data storage
- Prisma ORM for database access
- Docker setup for local development
- Testing with Vitest and Jest
- CI/CD with GitHub Actions

## Quick Start

```bash
# Clone the template
git clone https://github.com/username/react-express-postgis-template.git your-project-name
cd your-project-name

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start PostgreSQL and PostGIS with Docker
docker-compose up -d

# Initialize the database
npx prisma migrate dev
npx prisma generate

# Start development servers
npm run dev
```

## Documentation

- [Frontend Documentation](docs/frontend.md)
- [Backend Documentation](docs/backend.md)
- [Database Documentation](docs/database.md)
- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)

## License

MIT

```
### API Documentation

Create an API documentation file:

```markdown
# API Documentation

## Endpoints

### Locations

#### Create Location

- **URL**: `/api/locations`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "name": "Location Name",
    "description": "Location Description",
    "longitude": 0,
    "latitude": 0
  }
```

- **Response**: 
  
  ```json
  {
    "id": 1,
    "name": "Location Name",
    "description": "Location Description"
  }
  ```

#### Get Nearby Locations

- **URL**: `/api/locations/nearby`
- **Method**: `GET`
- **Query Parameters**:
  - `longitude`: Longitude coordinate
  - `latitude`: Latitude coordinate
  - `distance`: Distance in meters
- **Response**:
  
  ```json
  [
    {
      "id": 1,
      "name": "Location Name",
      "description": "Location Description",
      "geometry": {
        "type": "Point",
        "coordinates": [0, 0]
      },
      "distance": 100.5
    }
  ]
  ```
  
  ```
  
  ```

## 14. Example Usage Scenarios for AI Coding Agents

### Scenario 1: Creating a Business Directory

```markdown
# Task: Create a Business Directory

Create a business directory application that allows users to:
1. View businesses on a map
2. Search for businesses within a certain radius
3. Add new businesses with location data
4. Filter businesses by category

## Implementation Steps

1. Create a Business model with PostGIS location data
2. Implement API endpoints for CRUD operations on businesses
3. Create a map component to display businesses
4. Implement search functionality with distance filtering
5. Add forms for creating and editing businesses
6. Implement category filtering

## Technical Requirements

- Use the PostGIS integration for spatial queries
- Implement proper validation for business data
- Ensure responsive design for the map component
- Add proper error handling for API requests
```

### Scenario 2: User Location Tracking

```markdown
# Task: User Location Tracking

Create a feature that tracks user locations and provides relevant information based on their position:
1. Track user location changes
2. Store location history with timestamps
3. Calculate distance traveled
4. Show nearby points of interest

## Implementation Steps

1. Create a UserLocation model with PostGIS point geometry
2. Implement API endpoints for recording location updates
3. Create a service to calculate distance between points
4. Implement a map view showing location history
5. Add functionality to display nearby points of interest

## Technical Requirements

- Use browser geolocation API for tracking
- Implement efficient spatial queries for nearby locations
- Ensure privacy considerations are addressed
- Optimize for mobile devices
```

### Scenario 3: Geofencing Application

```markdown
# Task: Geofencing Application

Create a geofencing application that allows users to:
1. Define geographic boundaries (geofences)
2. Receive notifications when entering or leaving a geofence
3. View all geofences on a map
4. Get statistics about time spent in each geofence

## Implementation Steps

1. Create a Geofence model with PostGIS polygon geometry
2. Implement API endpoints for CRUD operations on geofences
3. Create a map component for drawing and editing geofences
4. Implement location tracking to detect geofence entry/exit
5. Add notification system for geofence events
6. Create a dashboard for geofence statistics

## Technical Requirements

- Use PostGIS ST_Contains function for geofence detection
- Implement efficient polygon storage and querying
- Ensure battery-efficient location tracking
- Add proper validation for geofence boundaries
```

This comprehensive template provides AI coding agents with a solid foundation for building modern web applications with spatial data capabilities. The PostGIS integration enables powerful location-based features, while the React and Vite frontend ensures a fast and responsive user experience.

## Citations

> 1. ****

There are three big outstanding updates that have been hanging over me for a while. React 19, Vite 6 and Vitest 3. Vite and Vitest are at the heart of my development process. React is _the_ dependency for my front-end packages. Understandably, I’m nervous given [my experience](https://www.thecandidstartup.org/2024/12/09/infinisheet-chore-updates.html) the last time I did a round of major updates.

Vitest 3

According to `npm ls vitest` there are no other dependencies on Vitest apart from Vitest add-on packages. Vitest 3 is the first version of Vitest that supports Vite 6. It also supports Vite 5, so it makes sense to update Vitest first.

```
% npm install -D vitest@3 @vitest/ui@3 @vitest/coverage-istanbul@3 @vitest/coverage-v8@3

added 13 packages, changed 13 packages, and audited 1146 packages in 6s
```

Source: [Link](https://www.thecandidstartup.org/2025/03/31/vitest-3-vite-6-react-19.html)

> 2. 🦋 express-openapi-validator now supports Express 5! Effortless OpenAPI 3.0/3.1 request validation ... I have just launched a nodejs based documentation site generator (docmd) and I need your feedback and support ... User Agreement Reddit, Inc. © 2025.

Source: [Link](https://www.reddit.com/r/node/comments/18rmlaj/expressjs_typescript_boilerplate_for_2024_backend/)

> 3. ****

This post outlines general patterns that have proven effective, both for Anthropic's internal teams and for external engineers using Claude Code across various codebases, languages, and environments. Nothing in this list is set in stone nor universally applicable; consider these suggestions as starting points. We encourage you to experiment and find what works best for you!

_Looking for more detailed information? Our comprehensive documentation at [claude.ai/code](https://claude.ai/code)_ _covers all the features mentioned in this post and provides additional examples, implementation details, and advanced techniques._

1\. Customize your setup

Claude Code is an agentic coding assistant that automatically pulls context into prompts. This context gathering consumes time and tokens, but you can optimize it through environment tuning.

a. Create `CLAUDE.md` files

Source: [Link](https://www.anthropic.com/engineering/claude-code-best-practices)

> 4. ****

A modern full-stack template using React, Vite, Express, and PostgreSQL.

Quick Start

# Clone and rename the template

git clone git@github.com:Avinava/simple-vite-react-express.git your-project-name
cd your-project-name

# Install dependencies

yarn (or npm install)

# Set up your environment

cp .env.example .env

# Initialize database

npx prisma migrate dev
npx prisma generate

# Start development

yarn dev

Template Structure

```
src/
├── client/               # Frontend React application
│   ├── components/       # Reusable components
│   ├── pages/            # Page components
│   └── theme/            # MUI theme customization
├── server/               # Backend Express application
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── middleware/       # Express middleware
│   └── utils/            # Utility functions
└── prisma/               # Database schema and migrations
```

First Steps After Cloning (Your Project Launch Checklist)

Source: [Link](https://github.com/Avinava/simple-vite-react-express)

> 5. ****

![](https://miro.medium.com/v2/resize:fill:64:64/1*dmbNkD5D-u45r44go_cf0g.png)

insert spatial data into postgres/postgis using typeorm in nestjs/nodejs

typeorm entity column:

[![Hussain Wali](https://miro.medium.com/v2/resize:fill:64:64/0*CQSN-W2-zTlbdc2Z.jpeg)](https://hussainwali.medium.com/?source=post_page---byline--2e03ab7ff0d---------------------------------------)

[Hussain Wali](https://hussainwali.medium.com/?source=post_page---byline--2e03ab7ff0d---------------------------------------)

Follow

1 min read

·

May 10, 2021

\--

2

Listen

Share

@ApiProperty({   
type: String,  
title: 'current\_location',  
example: '{"type":"Point","coordinates":\[29.612849, 77.229883\]}',  
})  
@Index({ spatial: true })  
@Column({  
type: 'geometry',  
srid: 4326,  
nullable: true,  
spatialFeatureType: 'Point',  
})  
current\_location: string;

function to insert data:

Source: [Link](https://hussainwali.medium.com/insert-spatial-data-into-postgres-postgis-using-typeorm-in-nestjs-nodejs-2e03ab7ff0d)

> 6. ****

async create(vehicle: VehicleEntity) {  
    return result = await this.connection  
        .createQueryBuilder()  
        .insert()  
        .into(VehicleEntity)  
        .values({  
          ...vehicle,  
          current\_location: () =>  
            \`ST\_GeomFromGeoJSON('${vehicle.current\_location}')\`,  
        })  
        .execute()  
        .catch((e) => {  
           throw new HttpException(e, HttpStatus.NOT\_IMPLEMENTED));   
         }  }

this took me a while but am glad I was able to make it work. If anyone is facing any issues with this let me know.

**bonus: Raw query to insert spatial data into postgress**

To insert spatial data into a PostgreSQL database, you can use the `ST_GeomFromText` function to convert the spatial data into a format that can be stored in the database. For example, the following query inserts a point with latitude and longitude coordinates into a table called `places`:

Source: [Link](https://hussainwali.medium.com/insert-spatial-data-into-postgres-postgis-using-typeorm-in-nestjs-nodejs-2e03ab7ff0d)

> 7. ****

Claude Code includes [headless mode](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview#automate-ci-and-infra-workflows) for non-interactive contexts like CI, pre-commit hooks, build scripts, and automation. Use the `-p` flag with a prompt to enable headless mode, and `--output-format stream-json` for streaming JSON output.

Note that headless mode does not persist between sessions. You have to trigger it each session.

a. Use Claude for issue triage

Headless mode can power automations triggered by GitHub events, such as when a new issue is created in your repository. For example, the public [Claude Code repository](https://github.com/anthropics/claude-code/blob/main/.github/actions/claude-issue-triage-action/action.yml) uses Claude to inspect new issues as they come in and assign appropriate labels.

b. Use Claude as a linter

Source: [Link](https://www.anthropic.com/engineering/claude-code-best-practices)

> 8. ****

`CLAUDE.md` is a special file that Claude automatically pulls into context when starting a conversation. This makes it an ideal place for documenting:

* Common bash commands
* Core files and utility functions
* Code style guidelines
* Testing instructions
* Repository etiquette (e.g., branch naming, merge vs. rebase, etc.)
* Developer environment setup (e.g., pyenv use, which compilers work)
* Any unexpected behaviors or warnings particular to the project
* Other information you want Claude to remember

There’s no required format for `CLAUDE.md` files. We recommend keeping them concise and human-readable. For example:

```
# Bash commands
- npm run build: Build the project
- npm run typecheck: Run the typechecker

# Code style
- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible (eg. import { foo } from 'bar')

Source: [Link](https://www.anthropic.com/engineering/claude-code-best-practices)
```

