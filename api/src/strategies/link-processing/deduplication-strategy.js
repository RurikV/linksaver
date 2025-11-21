const DataProcessingStrategy = require('../data-processing-strategy');

/**
 * Link Deduplication Strategy - Removes duplicate links based on URL
 * Implements the Strategy Pattern for data deduplication
 */
class DeduplicationStrategy extends DataProcessingStrategy {
  constructor(options = {}) {
    super('deduplication', {
      normalizeUrls: true,
      ignoreSubdomains: true,
      ignoreProtocol: true,
      ignoreTrailingSlash: true,
      ignoreQueryParams: false,
      caseInsensitive: true,
      ...options
    });
  }

  /**
   * Process data to remove duplicates
   * @param {Array} links - Links to deduplicate
   * @param {Object} context - Processing context
   * @returns {Promise<Array>} Deduplicated links
   */
  async process(links, context = {}) {
    if (!Array.isArray(links) || links.length === 0) {
      return links;
    }

    const seenUrls = new Set();
    const deduplicatedLinks = [];
    const duplicates = [];

    for (const link of links) {
      if (!link.url) {
        // Keep links without URLs
        deduplicatedLinks.push(link);
        continue;
      }

      const normalizedUrl = this.normalizeUrl(link.url);
      const urlKey = this.options.caseInsensitive ? normalizedUrl.toLowerCase() : normalizedUrl;

      if (seenUrls.has(urlKey)) {
        // Found duplicate
        duplicates.push({
          original: deduplicatedLinks.find(l => this.normalizeUrl(l.url) === normalizedUrl),
          duplicate: link,
          normalizedUrl
        });

        // Merge data from duplicate into original (prefer newer data)
        const original = deduplicatedLinks.find(l => this.normalizeUrl(l.url) === normalizedUrl);
        this.mergeLinkData(original, link);
      } else {
        // Add new unique link
        seenUrls.add(urlKey);
        deduplicatedLinks.push(link);
      }
    }

    // Add processing metadata
    const result = {
      links: deduplicatedLinks,
      metadata: {
        originalCount: links.length,
        deduplicatedCount: deduplicatedLinks.length,
        duplicatesRemoved: duplicates.length,
        duplicates: duplicates,
        strategy: this.name
      }
    };

    // Log duplicate information if context has logger
    if (context.logger && duplicates.length > 0) {
      context.logger.info(`Removed ${duplicates.length} duplicate links using ${this.name} strategy`, {
        duplicates: duplicates.map(d => ({
          url: d.normalizedUrl,
          duplicateTitle: d.duplicate.title,
          originalTitle: d.original.title
        }))
      });
    }

    return result;
  }

  /**
   * Normalize URL for comparison
   * @param {string} url - URL to normalize
   * @returns {string} Normalized URL
   */
  normalizeUrl(url) {
    try {
      let normalized = url.trim();

      // Remove protocol if specified
      if (this.options.ignoreProtocol) {
        normalized = normalized.replace(/^https?:\/\//, '');
      }

      // Remove www subdomain if specified
      if (this.options.ignoreSubdomains) {
        normalized = normalized.replace(/^www\./, '');
      }

      // Remove trailing slash if specified
      if (this.options.ignoreTrailingSlash) {
        normalized = normalized.replace(/\/$/, '');
      }

      // Remove query parameters if specified
      if (this.options.ignoreQueryParams) {
        normalized = normalized.split('?')[0];
      }

      // Convert to lowercase if specified
      if (this.options.caseInsensitive) {
        normalized = normalized.toLowerCase();
      }

      return normalized;

    } catch (error) {
      // If normalization fails, return original
      return url;
    }
  }

  /**
   * Merge data from duplicate link into original
   * @param {Object} original - Original link to merge into
   * @param {Object} duplicate - Duplicate link to merge from
   */
  mergeLinkData(original, duplicate) {
    // Merge tags (combine unique tags)
    if (duplicate.tags && Array.isArray(duplicate.tags)) {
      const originalTags = original.tags || [];
      const duplicateTagIds = duplicate.tags.map(t => t.tagId || t).filter(Boolean);
      const originalTagIds = originalTags.map(t => t.tagId || t).filter(Boolean);

      const combinedTags = [...originalTagIds, ...duplicateTagIds];
      const uniqueTags = [...new Set(combinedTags)];

      // Update original with combined tags
      original.tags = uniqueTags.map(tagId => {
        const existingTag = originalTags.find(t => (t.tagId || t) === tagId);
        if (existingTag) return existingTag;

        const newTag = duplicate.tags.find(t => (t.tagId || t) === tagId);
        return newTag || tagId;
      });
    }

    // Update description if duplicate has better description
    if (duplicate.description && duplicate.description.length > (original.description || '').length) {
      original.description = duplicate.description;
    }

    // Update title if original title is generic or empty
    if (duplicate.title && duplicate.title.length > (original.title || '').length) {
      original.title = duplicate.title;
    }

    // Update favicon if original doesn't have one
    if (!original.favicon && duplicate.favicon) {
      original.favicon = duplicate.favicon;
    }

    // Merge metadata
    if (duplicate.metadata) {
      original.metadata = {
        ...(original.metadata || {}),
        ...duplicate.metadata,
        mergedFrom: [original.metadata?.mergedFrom || [], duplicate.linkId].flat().filter(Boolean),
        lastMerge: new Date().toISOString()
      };
    }

    // Add source information
    if (duplicate.source && !original.source) {
      original.source = duplicate.source;
    }
  }

  /**
   * Check if deduplication can be applied
   * @param {Array} links - Links to check
   * @param {Object} context - Processing context
   * @returns {boolean} True if deduplication can be applied
   */
  canProcess(links, context = {}) {
    if (!Array.isArray(links) || links.length < 2) {
      return false;
    }

    // Check if links have URLs
    const linksWithUrls = links.filter(link => link && link.url);
    return linksWithUrls.length >= 2;
  }

  /**
   * Get strategy capabilities
   * @returns {Object} Strategy capabilities
   */
  getCapabilities() {
    return {
      name: this.name,
      description: 'Removes duplicate links based on URL normalization',
      supportedDataTypes: ['links'],
      configurableOptions: [
        'normalizeUrls',
        'ignoreSubdomains',
        'ignoreProtocol',
        'ignoreTrailingSlash',
        'ignoreQueryParams',
        'caseInsensitive'
      ],
      outputFields: ['deduplicatedLinks', 'duplicatesRemoved', 'metadata']
    };
  }
}

module.exports = DeduplicationStrategy;