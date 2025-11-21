/**
 * Base Data Processing Strategy - Implements the Strategy Pattern
 * Defines the interface for different data processing strategies
 */
class DataProcessingStrategy {
  constructor(name, options = {}) {
    this.name = name;
    this.options = options;
    this.enabled = true;
    this.priority = options.priority || 0;
  }

  /**
   * Process data using this strategy
   * @param {Array} data - Data to process
   * @param {Object} context - Processing context
   * @returns {Promise<Array>} Processed data
   */
  async process(data, context = {}) {
    throw new Error('process method must be implemented by concrete strategy');
  }

  /**
   * Validate if this strategy can be applied to the given data
   * @param {Array} data - Data to validate
   * @param {Object} context - Processing context
   * @returns {boolean} True if strategy can be applied
   */
  canProcess(data, context = {}) {
    return true;
  }

  /**
   * Get strategy metadata
   * @returns {Object} Strategy information
   */
  getMetadata() {
    return {
      name: this.name,
      enabled: this.enabled,
      priority: this.priority,
      options: this.options
    };
  }

  /**
   * Enable or disable this strategy
   * @param {boolean} enabled - Whether strategy should be enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Update strategy options
   * @param {Object} options - New options
   */
  updateOptions(options) {
    this.options = { ...this.options, ...options };
  }
}

module.exports = DataProcessingStrategy;