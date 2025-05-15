# Database Setup Guide

Follow these steps to set up the PostgreSQL/PostGIS database for the application.

## Prerequisites

Ensure you have the following installed:
- Docker and Docker Compose
- Node.js 20 or higher

## Setup Steps

1. **Start the PostgreSQL/PostGIS container**

   ```bash
   docker-compose up -d postgres
   ```

   This will start the PostgreSQL container with PostGIS extension.

2. **Run database migrations**

   ```bash
   npm run migrate
   ```

   This will create the tables and indexes needed for the application.

3. **Seed the database with sample data**

   ```bash
   npm run seed
   ```

   This will import sample restaurant data from the CSV file.

4. **Verify the database setup**

   ```bash
   node scripts/check-db.js
   ```

   This will check that the database is running, tables are created, and sample data is loaded.

## Database Connection

The application uses the `DATABASE_URL` environment variable to connect to the database. This is set in the `.env` file.

Default connection string:
```
postgres://postgres:postgres@localhost:5432/app_db
```

If you're using Docker, the connection string will be:
```
postgres://postgres:postgres@postgres:5432/app_db
```

## Troubleshooting

If you encounter issues with the database setup:

1. **Check database container is running**

   ```bash
   docker ps
   ```

   You should see the PostgreSQL container running.

2. **Check database logs**

   ```bash
   docker-compose logs postgres
   ```

3. **Connect directly to the database**

   ```bash
   docker exec -it ai-starter-app-postgis_postgres_1 psql -U postgres -d app_db
   ```

   Once connected, you can check tables:
   ```sql
   \dt
   SELECT COUNT(*) FROM restaurants;
   ```

4. **Restart the database container**

   ```bash
   docker-compose restart postgres
   ```

5. **Remove and recreate the database container**

   ```bash
   docker-compose down
   docker-compose up -d postgres
   npm run migrate
   npm run seed
   ```