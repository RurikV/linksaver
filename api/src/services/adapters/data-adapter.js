/**
 * Data Adapter Pattern Implementation
 * Provides a unified interface for different data sources (MongoDB, Pocket, CSV, etc.)
 */

class DataAdapter {
  constructor(source, options = {}) {
    this.source = source;
    this.options = options;
    this.metadata = {};
  }

  /**
   * Get links from the data source
   * @param {Object} filters - Filtering options
   * @returns {Promise<Array>} Array of links in standardized format
   */
  async getLinks(filters = {}) {
    throw new Error('getLinks method must be implemented by concrete adapter');
  }

  /**
   * Save links to the data source
   * @param {Array} links - Array of links to save
   * @returns {Promise<Object>} Result of the save operation
   */
  async saveLinks(links = []) {
    throw new Error('saveLinks method must be implemented by concrete adapter');
  }

  /**
   * Test if the adapter is properly configured
   * @returns {Promise<Object>} Test result with status and details
   */
  async testConnection() {
    throw new Error('testConnection method must be implemented by concrete adapter');
  }

  /**
   * Get metadata about the adapter and its capabilities
   * @returns {Object} Adapter metadata
   */
  getCapabilities() {
    return {
      source: this.source,
      supportedFormats: [],
      features: [],
      options: this.options
    };
  }

  /**
   * Transform data to standardized Link format
   * @param {Object} data - Raw data from source
   * @returns {Object} Standardized link object
   */
  transformToLink(data) {
    return {
      linkId: data.id || data.linkId || this.generateId(),
      title: data.title || data.name || 'Untitled',
      url: data.url || data.link || data.href,
      description: data.description || data.notes || '',
      tags: Array.isArray(data.tags) ? data.tags :
            (data.tag ? [data.tag] : []),
      favicon: data.favicon || data.icon || '',
      createdAt: data.createdAt || data.addedAt || new Date(),
      source: this.source,
      metadata: data.metadata || {}
    };
  }

  /**
   * Generate a unique ID
   * @returns {string} Generated ID
   */
  generateId() {
    return `${this.source}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate link data
   * @param {Object} link - Link object to validate
   * @returns {Object} Validation result
   */
  validateLink(link) {
    const errors = [];

    if (!link.url) {
      errors.push('URL is required');
    } else {
      try {
        new URL(link.url);
      } catch (error) {
        errors.push('Invalid URL format');
      }
    }

    if (!link.title) {
      errors.push('Title is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = DataAdapter;