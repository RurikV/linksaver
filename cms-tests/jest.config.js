/**
 * Jest Configuration for Universal CMS Testing
 *
 * Provides comprehensive test coverage with:
 * - Unit tests for all components
 * - Integration tests for services
 * - E2E tests for workflows
 * - Performance benchmarks
 * - Security tests
 * - Contract tests
 *
 * Coverage Requirements: 90%+
 */

module.exports = {
  // Test Environment
  testEnvironment: 'node',

  // Test File Patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.{js,ts}',
    '<rootDir>/src/**/*.spec.{js,ts}',
    '<rootDir>/tests/**/*.spec.{js,ts}'
  ],

  // Coverage Configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{js,ts}',
    '!src/**/*.spec.{js,ts}',
    '!src/**/index.ts',
    '!src/**/interfaces.ts',
    '!src/**/types.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'clover',
    'json'
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    // Specific thresholds for critical modules
    './src/container/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    },
    './src/components/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/plugins/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },

  // Setup and Teardown
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.ts'
  ],
  globalSetup: '<rootDir>/tests/global-setup.ts',
  globalTeardown: '<rootDir>/tests/global-teardown.ts',

  // Module Handling
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  moduleNameMapping: {
    '^@cms/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },

  // Test Configuration
  testTimeout: 30000,
  maxWorkers: 4,
  verbose: true,
  bail: false,
  forceExit: true,
  detectOpenHandles: true,
  detectLeaks: true,

  // Mock Configuration
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,

  // Reporting
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'coverage',
        outputName: 'junit.xml',
        ancestorSeparator: ' › ',
        uniqueOutputName: 'false',
        suiteNameTemplate: '{filepath}',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}'
      }
    ],
    [
      'jest-html-reporters',
      {
        publicPath: './coverage/html-report',
        filename: 'report.html',
        expand: true,
        hideIcon: false,
        pageTitle: 'Universal CMS Test Report',
        logoImgPath: undefined,
        inlineSource: false
      }
    ]
  ],

  // Performance Testing
  projects: [
    {
      displayName: 'Unit Tests',
      testMatch: ['<rootDir>/tests/unit/**/*.test.{js,ts}'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup/unit.ts']
    },
    {
      displayName: 'Integration Tests',
      testMatch: ['<rootDir>/tests/integration/**/*.test.{js,ts}'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup/integration.ts']
    },
    {
      displayName: 'E2E Tests',
      testMatch: ['<rootDir>/tests/e2e/**/*.test.{js,ts}'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup/e2e.ts'],
      testTimeout: 60000
    },
    {
      displayName: 'Performance Tests',
      testMatch: ['<rootDir>/tests/performance/**/*.test.{js,ts}'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup/performance.ts'],
      testTimeout: 120000
    },
    {
      displayName: 'Security Tests',
      testMatch: ['<rootDir>/tests/security/**/*.test.{js,ts}'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup/security.ts']
    },
    {
      displayName: 'Contract Tests',
      testMatch: ['<rootDir>/tests/contract/**/*.test.{js,ts}'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup/contract.ts']
    }
  ],

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