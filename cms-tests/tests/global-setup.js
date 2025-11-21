/**
 * Global Jest Setup
 * Runs once before all test suites
 */

module.exports = async () => {
  // Global setup logic
  console.log('🚀 Starting Universal CMS Test Suite');

  // Set up global test environment variables
  process.env.NODE_ENV = 'test';
  process.env.CMS_TEST_MODE = 'true';

  // Initialize test database connections if needed
  // Initialize test external services if needed

  console.log('✅ Global setup completed');
};