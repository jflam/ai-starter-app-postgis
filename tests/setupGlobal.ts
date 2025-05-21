import { startPg } from './_setupDb';

// Global setup for Vitest
export async function setup() {
  // Start the PostgreSQL container
  console.log('Starting database container...');
  const container = await startPg();
  
  // Return the teardown function that Vitest will call after all tests
  return async () => {
    // Stop the container when tests are complete
    if (container) {
      await container.stop();
      console.log('Database container stopped');
    }
  };
}
