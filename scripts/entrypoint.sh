#!/bin/sh
set -e

# Run migrations
node-pg-migrate -d "$DATABASE_URL" -m /app/migrations

# Seed the database
node /app/dist/scripts/seed.js

# Start the server
exec node /app/dist/server/index.js