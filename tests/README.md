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

## E2E Test Data Considerations

*   **Consistency is Key:** E2E tests interact with the live application, which often relies on a database. For tests to be stable and reliable, the underlying data they interact with should be consistent across test runs.
*   **Current Approach:** The application (and thus E2E tests) currently runs against the development database as described in the "Database Testing" section. This means tests depend on the current state of `data/table.csv` and the seeding process (e.g., `scripts/seed.js` or `scripts/seed.ts`).
*   **Potential Issues:**
    *   If data changes frequently or is manually altered, E2E tests that make specific assertions about data (e.g., expecting a certain number of restaurants, specific restaurant names, or filter results) can become flaky.
    *   Tests that modify data (if any were to be added in the future) could interfere with each other or leave the database in an inconsistent state for subsequent tests or development.
*   **Recommendations for Robustness:**
    *   **Dedicated Test Dataset:** For critical E2E tests, consider using a dedicated, static dataset that is loaded before E2E test runs. This could involve a separate seed script or snapshot for testing purposes.
    *   **Data Reset Procedures:** Implement a reliable way to reset the database to a known state before each E2E test suite execution or even before individual tests if they are destructive. The existing seeding mechanism could be leveraged for this.
    *   **Avoid Data-Dependent Assertions (where possible):** Write tests to be resilient to data changes where appropriate (e.g., checking for the presence of elements rather than specific text if that text is highly dynamic). However, for many E2E scenarios, asserting specific data is crucial.
    *   **API Mocking (Advanced):** For more isolated frontend E2E tests, consider mocking API responses to ensure the frontend behaves correctly regardless of backend data. However, this trades full end-to-end validation for more control and less flakiness.

## Test Isolation

- Each set of tests can be run independently
- Server tests are run with `// @vitest-environment node` annotation
- Tests run serially to avoid database conflicts