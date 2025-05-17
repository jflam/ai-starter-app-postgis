# Testing in ai-starter-app-postgis

## Overview

This project uses a unified testing approach with Vitest for all client and server tests. End-to-end tests use Playwright.

## Test Types

- **Unit Tests (Client)**: React component and hook tests using React Testing Library and JSDOM environment
- **API Tests (Server)**: API integration tests using Supertest with a real PostGIS container
- **E2E Tests**: End-to-end tests using Playwright

## Test Structure

- `tests/client/` - Client-side tests (React components, hooks)
- `tests/server/` - Server-side tests (API endpoints)
- `tests/e2e/` - End-to-end tests (Playwright)
- `tests/_setupDb.ts` - Database setup helper for PostGIS container
- `tests/setupGlobal.ts` - Global setup for Vitest to manage PostGIS container
- `tests/client/setup.ts` - Client setup for React Testing Library

## Running Tests

- `npm test` - Run all unit and API tests with coverage
- `npm run test:client` - Run only client tests
- `npm run test:server` - Run only server tests
- `npm run test:e2e` - Run end-to-end tests with Playwright
- `npm run test:all` - Run all tests (unit, API, and E2E)

## Configuration

The Vitest configuration in `vitest.config.ts` includes:

- JSDOM environment for client tests
- Node environment for server tests (via file annotation)
- Global setup for database container
- Coverage reporting
- Serial test execution for database stability

## Database Testing

Server tests connect to the PostgreSQL database:

1. When running inside Docker (via `docker compose up`): Tests connect to the PostgreSQL service defined in docker-compose.yml 
2. When running locally (outside Docker): Tests connect to a local PostgreSQL database (typically at localhost:5432)

This approach simplifies testing by:
- Avoiding the overhead of starting another database container for tests
- Using the same database schema and data that the application uses
- Making tests faster and more reliable

## Test Isolation

- Each set of tests can be run independently
- Server tests are run with `// @vitest-environment node` annotation
- Tests run serially to avoid database conflicts