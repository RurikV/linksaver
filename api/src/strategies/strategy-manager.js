const DeduplicationStrategy = require('./link-processing/deduplication-strategy');
const EnrichmentStrategy = require('./link-processing/enrichment-strategy');
const ProcessingContext = require('./link-processing/processing-context');

/**
 * Strategy Manager - Implements the Strategy Pattern coordination
 * Manages multiple data processing strategies and applies them as needed
 */
class StrategyManager {
  constructor() {
    this.strategies = new Map();
    this.defaultStrategies = ['deduplication', 'enrichment'];
    this.initializeDefaultStrategies();
  }

  /**
   * Initialize default strategies
   */
  initializeDefaultStrategies() {
    this.registerStrategy('deduplication', DeduplicationStrategy);
    this.registerStrategy('enrichment', EnrichmentStrategy);
  }

  /**
   * Register a new strategy
   * @param {string} name - Strategy name
   * @param {Class} StrategyClass - Strategy constructor
   * @param {Object} defaultOptions - Default options for the strategy
   */
  registerStrategy(name, StrategyClass, defaultOptions = {}) {
    this.strategies.set(name, {
      StrategyClass,
      defaultOptions
    });
  }

  /**
   * Get strategy instance
   * @param {string} name - Strategy name
   * @param {Object} options - Strategy options
   * @returns {Object} Strategy instance
   */
  getStrategy(name, options = {}) {
    const strategyConfig = this.strategies.get(name);
    if (!strategyConfig) {
      throw new Error(`Unknown strategy: ${name}`);
    }

    const { StrategyClass, defaultOptions } = strategyConfig;
    const mergedOptions = { ...defaultOptions, ...options };

    return new StrategyClass(mergedOptions);
  }

  /**
   * Process data using multiple strategies
   * @param {Array} data - Data to process
   * @param {string|Array} strategyNames - Strategy name(s) to apply
   * @param {Object} contextOptions - Context options
   * @returns {Promise<Object>} Processing result
   */
  async processData(data, strategyNames = this.defaultStrategies, contextOptions = {}) {
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }

    // Create processing context
    const context = new ProcessingContext(contextOptions.userId || 'anonymous', contextOptions);

    // Normalize strategy names to array
    const strategies = Array.isArray(strategyNames) ? strategyNames : [strategyNames];

    let processedData = data;
    const processingResults = [];

    context.logInfo(`Starting data processing with strategies: ${strategies.join(', ')}`, {
      dataCount: data.length,
      strategies: strategies
    });

    try {
      // Apply each strategy in sequence
      for (const strategyName of strategies) {
        context.setStrategy(strategyName);

        const strategy = this.getStrategy(strategyName, contextOptions[strategyName]);

        context.logInfo(`Applying strategy: ${strategyName}`, {
          dataCount: processedData.length,
          strategyOptions: strategy.options
        });

        // Check if strategy can process the data
        if (strategy.canProcess(processedData, context)) {
          const result = await strategy.process(processedData, context);

          // Update processed data for next strategy
          if (result.links) {
            processedData = result.links;
          } else {
            processedData = result;
          }

          processingResults.push({
            strategy: strategyName,
            success: true,
            result,
            metadata: result.metadata || {}
          });

          context.incrementSuccess();
          context.logInfo(`Strategy ${strategyName} completed successfully`, {
            resultMetadata: result.metadata
          });

        } else {
          context.logWarning(`Strategy ${strategyName} cannot process the data`, {
            dataCount: processedData.length
          });

          processingResults.push({
            strategy: strategyName,
            success: false,
            reason: 'Strategy cannot process the data'
          });
        }

        context.incrementProcessed();
      }

      const summary = context.getSummary();

      return {
        success: context.isSuccess(),
        data: processedData,
        originalData: data,
        processingResults,
        summary,
        context: {
          userId: context.userId,
          requestId: context.metadata.requestId,
          strategiesApplied: strategies,
          hasWarnings: context.hasWarnings()
        }
      };

    } catch (error) {
      context.logError('Processing failed', {
        error: error.message,
        strategy: context.metadata.strategy,
        dataCount: processedData.length
      });

      return {
        success: false,
        error: error.message,
        data: processedData, // Return partially processed data
        originalData: data,
        processingResults,
        summary: context.getSummary()
      };
    }
  }

  /**
   * Process data with a single strategy
   * @param {Array} data - Data to process
   * @param {string} strategyName - Strategy name
   * @param {Object} strategyOptions - Strategy options
   * @param {Object} contextOptions - Context options
   * @returns {Promise<Object>} Processing result
   */
  async processWithSingleStrategy(data, strategyName, strategyOptions = {}, contextOptions = {}) {
    return await this.processData(data, [strategyName], {
      ...contextOptions,
      [strategyName]: strategyOptions
    });
  }

  /**
   * Get available strategies
   * @returns {Array} Array of strategy information
   */
  getAvailableStrategies() {
    const strategies = [];

    for (const [name, config] of this.strategies) {
      try {
        const tempStrategy = new config.StrategyClass(config.defaultOptions);
        strategies.push({
          name,
          capabilities: tempStrategy.getCapabilities ? tempStrategy.getCapabilities() : {},
          defaultOptions: config.defaultOptions,
          isDefault: this.defaultStrategies.includes(name)
        });
      } catch (error) {
        // Skip strategies that can't be instantiated
        console.warn(`Failed to instantiate strategy ${name}:`, error.message);
      }
    }

    return strategies;
  }

  /**
   * Test strategy on sample data
   * @param {string} strategyName - Strategy name
   * @param {Array} sampleData - Sample data to test
   * @param {Object} strategyOptions - Strategy options
   * @returns {Promise<Object>} Test result
   */
  async testStrategy(strategyName, sampleData, strategyOptions = {}) {
    try {
      const strategy = this.getStrategy(strategyName, strategyOptions);
      const context = new ProcessingContext('test', { requestId: 'test_' + Date.now() });

      const canProcess = strategy.canProcess(sampleData, context);

      if (!canProcess) {
        return {
          success: false,
          reason: 'Strategy cannot process the provided data',
          strategy: strategyName,
          dataCount: sampleData.length
        };
      }

      const startTime = Date.now();
      const result = await strategy.process(sampleData, context);
      const duration = Date.now() - startTime;

      return {
        success: true,
        strategy: strategyName,
        dataCount: sampleData.length,
        processingTime: duration,
        result: result.metadata || {},
        canProcess: true
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        strategy: strategyName,
        dataCount: sampleData.length
      };
    }
  }

  /**
   * Get strategy recommendations for data
   * @param {Array} data - Data to analyze
   * @returns {Array} Recommended strategies
   */
  getRecommendedStrategies(data) {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    const recommendations = [];

    for (const [name, config] of this.strategies) {
      try {
        const strategy = new config.StrategyClass(config.defaultOptions);
        if (strategy.canProcess(data, {})) {
          recommendations.push({
            name,
            reason: `Strategy can process ${data.length} items`,
            capabilities: strategy.getCapabilities ? strategy.getCapabilities() : {}
          });
        }
      } catch (error) {
        // Skip strategies that can't be instantiated or tested
      }
    }

    return recommendations;
  }

  /**
   * Set default strategies
   * @param {Array} strategyNames - Array of strategy names
   */
  setDefaultStrategies(strategyNames) {
    // Validate that all strategies exist
    for (const name of strategyNames) {
      if (!this.strategies.has(name)) {
        throw new Error(`Unknown strategy: ${name}`);
      }
    }

    this.defaultStrategies = [...strategyNames];
  }

  /**
   * Get default strategies
   * @returns {Array} Array of default strategy names
   */
  getDefaultStrategies() {
    return [...this.defaultStrategies];
  }
}

module.exports = StrategyManager;