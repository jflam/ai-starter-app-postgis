module.exports = {
  extends: '@istanbuljs/nyc-config-typescript',
  all: true,
  include: ['src/**/*.ts', 'src/**/*.tsx'],
  exclude: ['**/*.d.ts', 'src/client/vite-env.d.ts', 'dist/**', 'tests/**'],
  reporter: ['html', 'lcov', 'text-summary'],
  'check-coverage': true,
  branches: 0,
  lines: 0,
  functions: 0,
  statements: 0,
};