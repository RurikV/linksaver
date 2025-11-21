/**
 * Processing Context - Provides context for data processing strategies
 * Contains metadata, configuration, and utilities for strategy execution
 */
class ProcessingContext {
  constructor(userId, options = {}) {
    this.userId = userId;
    this.options = options;
    this.metadata = {
      startTime: new Date(),
      requestId: options.requestId || this.generateId(),
      strategy: null,
      processedCount: 0,
      errors: [],
      warnings: []
    };
    this.logger = options.logger || console;
    this.stats = {
      totalProcessed: 0,
      successCount: 0,
      errorCount: 0,
      warningCount: 0
    };
  }

  /**
   * Generate unique context ID
   * @returns {string} Unique ID
   */
  generateId() {
    return `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set the current strategy being used
   * @param {string} strategyName - Strategy name
   */
  setStrategy(strategyName) {
    this.metadata.strategy = strategyName;
  }

  /**
   * Log an error
   * @param {string} message - Error message
   * @param {Object} data - Additional error data
   */
  logError(message, data = {}) {
    const error = {
      message,
      timestamp: new Date(),
      data
    };
    this.metadata.errors.push(error);
    this.stats.errorCount++;
    this.logger.error(`[${this.metadata.requestId}] ${message}`, data);
  }

  /**
   * Log a warning
   * @param {string} message - Warning message
   * @param {Object} data - Additional warning data
   */
  logWarning(message, data = {}) {
    const warning = {
      message,
      timestamp: new Date(),
      data
    };
    this.metadata.warnings.push(warning);
    this.stats.warningCount++;
    this.logger.warn(`[${this.metadata.requestId}] ${message}`, data);
  }

  /**
   * Log an info message
   * @param {string} message - Info message
   * @param {Object} data - Additional data
   */
  logInfo(message, data = {}) {
    this.logger.info(`[${this.metadata.requestId}] ${message}`, data);
  }

  /**
   * Increment processed count
   * @param {number} count - Number of items processed
   */
  incrementProcessed(count = 1) {
    this.metadata.processedCount += count;
    this.stats.totalProcessed += count;
  }

  /**
   * Increment success count
   * @param {number} count - Number of successful processes
   */
  incrementSuccess(count = 1) {
    this.stats.successCount += count;
  }

  /**
   * Get processing summary
   * @returns {Object} Processing summary
   */
  getSummary() {
    return {
      userId: this.userId,
      requestId: this.metadata.requestId,
      strategy: this.metadata.strategy,
      startTime: this.metadata.startTime,
      endTime: new Date(),
      duration: Date.now() - this.metadata.startTime.getTime(),
      stats: this.stats,
      errors: this.metadata.errors,
      warnings: this.metadata.warnings,
      options: this.options
    };
  }

  /**
   * Check if processing was successful
   * @returns {boolean} True if no errors occurred
   */
  isSuccess() {
    return this.metadata.errors.length === 0;
  }

  /**
   * Check if processing has warnings
   * @returns {boolean} True if warnings exist
   */
  hasWarnings() {
    return this.metadata.warnings.length > 0;
  }
}

module.exports = ProcessingContext;