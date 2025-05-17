/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/client'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/client/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    include: ['./tests/{client,server}/**/*.{test,spec}.{ts,tsx}'],
    // Run tests serially to avoid database conflicts
    sequence: {
      setupFiles: 'list',
    },
    // We can disable threads for safety with database tests
    threads: false,
  },
});