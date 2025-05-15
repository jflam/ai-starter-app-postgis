#!/bin/sh
set -e

# Run migrations
node-pg-migrate -d "$DATABASE_URL" -m /app/migrations

# Seed the database
node /app/scripts/seed.js

# Start the server
exec node /app/src/server/simplified-server.js