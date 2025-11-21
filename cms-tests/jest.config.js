/**
 * Jest Configuration for Universal CMS Testing
 */

module.exports = {
  // Test Environment
  testEnvironment: 'node',

  // Test File Patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.{js,ts}',
    '<rootDir>/tests/**/*.spec.{js,ts}'
  ],

  // Coverage Configuration
  collectCoverage: true,
  collectCoverageFrom: [
    '../cms-core/dist/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/tests/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json',
    'clover'
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },

  // Module Handling
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // TypeScript configuration
  preset: 'ts-jest',

  // Transform configuration
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },

  // Test Configuration
  maxWorkers: 4,
  verbose: false,
  bail: false,
  forceExit: true,
  detectOpenHandles: true,

  // Mock Configuration
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Ignore Patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/build/',
    '/temp/'
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!(module-to-transform)/)'
  ]
};