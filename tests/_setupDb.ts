import { PostgreSqlContainer } from 'testcontainers';
import { execaCommand } from 'execa';
import path from 'path';

export async function startPg() {
  // Start PostGIS container
  const container = await new PostgreSqlContainer('postgis/postgis:15-3.4')
    .withExposedPorts(5432)
    .withCommand([
      'postgres', 
      '-c', 'shared_buffers=256MB', 
      '-c', 'max_connections=100'
    ])
    .start();

  // Set environment variable for database connection
  const connectionString = container.getConnectionUri();
  process.env.DATABASE_URL = connectionString;
  
  console.log(`Database container started on port ${container.getMappedPort(5432)}`);
  console.log(`Connection string: ${connectionString}`);

  // Run migrations
  await execaCommand('npm run migrate', { stdio: 'inherit' });
  
  // Run seed script
  await execaCommand('npm run seed', { stdio: 'inherit' });

  return container;
}

// For global setup/teardown with Jest
export async function setup() {
  const container = await startPg();
  // @ts-ignore - Store the container for teardown
  global.__PG_CONTAINER__ = container;
}

export async function teardown() {
  // @ts-ignore - Retrieve and stop the container
  const container = global.__PG_CONTAINER__;
  if (container) {
    await container.stop();
  }
}