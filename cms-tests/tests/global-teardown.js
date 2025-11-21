/**
 * Global Jest Teardown
 * Runs once after all test suites
 */

module.exports = async () => {
  // Global cleanup logic
  console.log('🧹 Cleaning up Universal CMS Test Suite');

  // Clean up test database connections if needed
  // Clean up test external services if needed
  // Clear any global state

  console.log('✅ Global teardown completed');
};