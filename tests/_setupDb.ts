import { GenericContainer } from 'testcontainers';
import { execa } from 'execa';
import path from 'path';

export async function startPg() {
  // Start PostGIS container
  const container = await new GenericContainer('postgis/postgis:15-3.4')
    .withExposedPorts(5432)
    .withEnvironment({
      POSTGRES_USER: 'postgres',
      POSTGRES_PASSWORD: 'postgres',
      POSTGRES_DB: 'test_db'
    })
    .withCommand([
      'postgres', 
      '-c', 'shared_buffers=256MB', 
      '-c', 'max_connections=100'
    ])
    .start();

  // Set environment variable for database connection
  const port = container.getMappedPort(5432);
  const connectionString = `postgres://postgres:postgres@localhost:${port}/test_db`;
  process.env.DATABASE_URL = connectionString;
  
  console.log(`Database container started on port ${container.getMappedPort(5432)}`);
  console.log(`Connection string: ${connectionString}`);

  // Run migrations
  await execa('npm', ['run', 'migrate'], { stdio: 'inherit' });
  
  // Run seed script
  await execa('npm', ['run', 'seed'], { stdio: 'inherit' });

  return container;
}

// For global setup/teardown with Vitest
export async function setup() {
  const container = await startPg();
  // Store the container reference to be used in teardown
  return container;
}

export async function teardown(container: any) {
  if (container) {
    await container.stop();
    console.log('Database container stopped');
  }
}