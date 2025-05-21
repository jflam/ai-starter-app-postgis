#!/bin/bash

# Script to run migrations and seed for testing
# This ensures the database is properly prepared before running tests

echo "Setting up test database..."

# Set database connection for local testing
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/test_db"
echo "Using database URL: $DATABASE_URL"

# Run migrations
echo "Running database migrations..."
NODE_PATH=./node_modules npx node-pg-migrate up -m migrations

if [ $? -ne 0 ]; then
  echo "Migration failed"
  exit 1
fi

# Run seed script
echo "Running database seeding..."
node scripts/seed.js

if [ $? -ne 0 ]; then
  echo "Seeding failed"
  exit 1
fi

echo "Test database setup complete"