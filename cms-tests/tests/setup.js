/**
 * Global Jest Setup
 * Configures global test environment and utilities
 */

// Set global test timeout
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore specific console methods during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Global test utilities
global.testUtils = {
  /**
   * Wait for specified milliseconds
   */
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Create a mock service factory
   */
  createMockFactory: (instance) => ({
    create: jest.fn().mockResolvedValue(instance),
    dispose: jest.fn().mockResolvedValue(undefined)
  }),

  /**
   * Generate random test data
   */
  randomString: (length = 10) => Math.random().toString(36).substr(2, length),

  /**
   * Create mock component metadata
   */
  createMockMetadata: (overrides = {}) => ({
    name: 'TestComponent',
    category: 'test',
    tags: ['test', 'mock'],
    configuration: {},
    dependencies: [],
    ...overrides
  })
};