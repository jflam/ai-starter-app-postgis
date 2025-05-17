import { vi, afterEach } from 'vitest';
import '@testing-library/jest-dom';

// Clean up after each test
afterEach(() => {
  vi.resetAllMocks();
});