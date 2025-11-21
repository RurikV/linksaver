const DataAdapter = require('./adapters/data-adapter');
const MongoAdapter = require('./adapters/mongo-adapter');
const CsvAdapter = require('./adapters/csv-adapter');
const ChromeBookmarksAdapter = require('./adapters/chrome-bookmarks-adapter');

/**
 * Data Manager - Coordinates between different data adapters
 * Provides a unified interface for the application to work with multiple data sources
 */
class DataManager {
  constructor() {
    this.adapters = new Map();
    this.defaultAdapter = 'mongodb';
    this.initializeDefaultAdapters();
  }

  /**
   * Initialize default adapters
   */
  initializeDefaultAdapters() {
    // MongoDB adapter (default)
    this.registerAdapter('mongodb', MongoAdapter);

    // CSV adapter for import/export
    this.registerAdapter('csv', CsvAdapter);

    // Chrome Bookmarks adapter
    this.registerAdapter('chrome-bookmarks', ChromeBookmarksAdapter);
  }

  /**
   * Register a new data adapter
   * @param {string} name - Adapter name
   * @param {Class} AdapterClass - Adapter constructor
   * @returns {DataManager} This instance for chaining
   */
  registerAdapter(name, AdapterClass) {
    this.adapters.set(name, AdapterClass);
    return this;
  }

  /**
   * Get adapter instance
   * @param {string} name - Adapter name
   * @param {Object} options - Adapter options
   * @returns {DataAdapter} Adapter instance
   */
  getAdapter(name, options = {}) {
    const AdapterClass = this.adapters.get(name);
    if (!AdapterClass) {
      throw new Error(`Unknown adapter: ${name}`);
    }

    // Create instance with caching
    const cacheKey = `${name}_${JSON.stringify(options)}`;
    if (!this._adapterInstances) {
      this._adapterInstances = new Map();
    }

    if (!this._adapterInstances.has(cacheKey)) {
      this._adapterInstances.set(cacheKey, new AdapterClass(options));
    }

    return this._adapterInstances.get(cacheKey);
  }

  /**
   * Get links from specified adapter
   * @param {string} adapterName - Adapter name
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Array of links
   */
  async getLinks(adapterName = this.defaultAdapter, filters = {}) {
    const adapter = this.getAdapter(adapterName);
    return await adapter.getLinks(filters);
  }

  /**
   * Save links to specified adapter
   * @param {string} adapterName - Adapter name
   * @param {Array} links - Links to save
   * @param {Object} options - Save options
   * @returns {Promise<Object>} Save result
   */
  async saveLinks(adapterName = this.defaultAdapter, links = [], options = {}) {
    const adapter = this.getAdapter(adapterName, options);
    return await adapter.saveLinks(links);
  }

  /**
   * Test adapter connection
   * @param {string} adapterName - Adapter name
   * @param {Object} options - Test options
   * @returns {Promise<Object>} Test result
   */
  async testAdapter(adapterName, options = {}) {
    const adapter = this.getAdapter(adapterName, options);
    return await adapter.testConnection();
  }

  /**
   * Get adapter capabilities
   * @param {string} adapterName - Adapter name
   * @param {Object} options - Options
   * @returns {Object} Adapter capabilities
   */
  getAdapterCapabilities(adapterName, options = {}) {
    const adapter = this.getAdapter(adapterName, options);
    return adapter.getCapabilities();
  }

  /**
   * Import links from different sources
   * @param {string} sourceType - Source type
   * @param {Object} importData - Import configuration
   * @returns {Promise<Object>} Import result
   */
  async importLinks(sourceType, importData) {
    const { userId, filters = {} } = importData;

    try {
      // Get links from source
      const links = await this.getLinks(sourceType, {
        userId,
        ...filters,
        ...importData
      });

      // Save to default adapter (MongoDB)
      const result = await this.saveLinks(this.defaultAdapter, links, {
        userId,
        source: sourceType
      });

      return {
        success: true,
        source: sourceType,
        imported: links.length,
        saved: result.success.length,
        errors: result.errors || [],
        message: `Successfully imported ${links.length} links from ${sourceType}`
      };

    } catch (error) {
      return {
        success: false,
        source: sourceType,
        error: error.message,
        message: `Failed to import from ${sourceType}: ${error.message}`
      };
    }
  }

  /**
   * Export links to different formats
   * @param {string} targetFormat - Target format
   * @param {Object} exportData - Export configuration
   * @returns {Promise<Object>} Export result
   */
  async exportLinks(targetFormat, exportData) {
    const { userId, filters = {}, options = {} } = exportData;

    try {
      // Get links from default adapter
      const links = await this.getLinks(this.defaultAdapter, {
        userId,
        ...filters
      });

      // Export to target format
      const result = await this.saveLinks(targetFormat, links, {
        userId,
        ...options
      });

      return {
        success: true,
        format: targetFormat,
        exported: links.length,
        message: `Successfully exported ${links.length} links to ${targetFormat}`,
        ...result
      };

    } catch (error) {
      return {
        success: false,
        format: targetFormat,
        error: error.message,
        message: `Failed to export to ${targetFormat}: ${error.message}`
      };
    }
  }

  /**
   * Get all available adapters
   * @returns {Array} Array of adapter information
   */
  getAvailableAdapters() {
    const adapters = [];

    for (const [name, AdapterClass] of this.adapters) {
      try {
        const tempAdapter = new AdapterClass();
        adapters.push({
          name,
          capabilities: tempAdapter.getCapabilities(),
          isDefault: name === this.defaultAdapter
        });
      } catch (error) {
        // Skip adapters that can't be instantiated
        console.warn(`Failed to instantiate adapter ${name}:`, error.message);
      }
    }

    return adapters;
  }

  /**
   * Set default adapter
   * @param {string} adapterName - Adapter name
   */
  setDefaultAdapter(adapterName) {
    if (!this.adapters.has(adapterName)) {
      throw new Error(`Unknown adapter: ${adapterName}`);
    }
    this.defaultAdapter = adapterName;
  }

  /**
   * Get default adapter name
   * @returns {string} Default adapter name
   */
  getDefaultAdapter() {
    return this.defaultAdapter;
  }
}

module.exports = DataManager;