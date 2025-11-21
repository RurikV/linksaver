const DataProcessingStrategy = require('../data-processing-strategy');

/**
 * Link Enrichment Strategy - Enhances links with additional data
 * Implements the Strategy Pattern for data enrichment
 */
class EnrichmentStrategy extends DataProcessingStrategy {
  constructor(options = {}) {
    super('enrichment', {
      autoGenerateTitles: true,
      extractFavicons: true,
      fetchMetadata: false, // Disabled by default to avoid network calls
      categorizeLinks: true,
      validateUrls: true,
      enrichTags: true,
      generateDescriptions: false, // Disabled by default
      timeout: 5000,
      maxRetries: 2,
      ...options
    });
  }

  /**
   * Process data to enrich links with additional information
   * @param {Array} links - Links to enrich
   * @param {Object} context - Processing context
   * @returns {Promise<Array>} Enriched links
   */
  async process(links, context = {}) {
    if (!Array.isArray(links) || links.length === 0) {
      return links;
    }

    const enrichedLinks = [];
    const enrichmentStats = {
      titlesGenerated: 0,
      urlsValidated: 0,
      invalidUrls: 0,
      tagsAdded: 0,
      categoriesAdded: 0,
      faviconsAdded: 0
    };

    for (const link of links) {
      const enrichedLink = { ...link };

      try {
        // Auto-generate titles if missing
        if (this.options.autoGenerateTitles && !enrichedLink.title) {
          enrichedLink.title = this.generateTitle(enrichedLink);
          enrichmentStats.titlesGenerated++;
        }

        // Validate and normalize URLs
        if (this.options.validateUrls && enrichedLink.url) {
          if (this.isValidUrl(enrichedLink.url)) {
            enrichedLink.url = this.normalizeUrl(enrichedLink.url);
            enrichmentStats.urlsValidated++;
          } else {
            enrichmentStats.invalidUrls++;
            // Optionally mark invalid URLs
            enrichedLink.invalidUrl = true;
          }
        }

        // Extract favicon info
        if (this.options.extractFavicons && enrichedLink.url && !enrichedLink.favicon) {
          enrichedLink.favicon = this.extractFavicon(enrichedLink.url);
          if (enrichedLink.favicon) {
            enrichmentStats.faviconsAdded++;
          }
        }

        // Auto-categorize links
        if (this.options.categorizeLinks) {
          const categories = this.categorizeLink(enrichedLink);
          if (categories && categories.length > 0) {
            enrichedLink.categories = categories;
            enrichmentStats.categoriesAdded += categories.length;
          }
        }

        // Enrich with auto-generated tags
        if (this.options.enrichTags) {
          const autoTags = this.generateTags(enrichedLink);
          if (autoTags && autoTags.length > 0) {
            // Merge with existing tags
            const existingTags = enrichedLink.tags || [];
            const existingTagIds = existingTags.map(t => t.tagId || t).filter(Boolean);
            const autoTagIds = autoTags.map(t => t.tagId || t).filter(Boolean);

            const combinedTags = [...new Set([...existingTagIds, ...autoTagIds])];
            enrichedLink.tags = combinedTags.map(tagId => {
              const existingTag = existingTags.find(t => (t.tagId || t) === tagId);
              if (existingTag) return existingTag;

              const newTag = autoTags.find(t => (t.tagId || t) === tagId);
              return newTag || { tagId: tagId, title: tagId };
            });
            enrichmentStats.tagsAdded += autoTags.length;
          }
        }

        // Add enrichment metadata
        enrichedLink.metadata = {
          ...(enrichedLink.metadata || {}),
          enriched: true,
          enrichmentStrategy: this.name,
          enrichedAt: new Date().toISOString(),
          enrichmentOptions: this.options
        };

        enrichedLinks.push(enrichedLink);

      } catch (error) {
        // Add link even if enrichment fails
        enrichedLink.metadata = {
          ...(enrichedLink.metadata || {}),
          enrichmentError: error.message,
          enrichmentFailed: true
        };
        enrichedLinks.push(enrichedLink);

        if (context.logger) {
          context.logger.warn(`Failed to enrich link: ${error.message}`, { link: enrichedLink });
        }
      }
    }

    return {
      links: enrichedLinks,
      metadata: {
        originalCount: links.length,
        enrichedCount: enrichedLinks.length,
        strategy: this.name,
        stats: enrichmentStats
      }
    };
  }

  /**
   * Generate title from URL or other link data
   * @param {Object} link - Link to generate title for
   * @returns {string} Generated title
   */
  generateTitle(link) {
    if (link.url) {
      try {
        const urlObj = new URL(link.url);
        // Extract domain name and use as title
        const domain = urlObj.hostname.replace('www.', '');
        return domain.charAt(0).toUpperCase() + domain.slice(1);
      } catch (error) {
        // Fallback to URL domain extraction
        const match = link.url.match(/https?:\/\/(?:www\.)?([^\/]+)/);
        if (match) {
          return match[1];
        }
      }
    }

    return link.description ? link.description.substring(0, 50) + '...' : 'Untitled';
  }

  /**
   * Validate URL format
   * @param {string} url - URL to validate
   * @returns {boolean} True if URL is valid
   */
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Normalize URL format
   * @param {string} url - URL to normalize
   * @returns {string} Normalized URL
   */
  normalizeUrl(url) {
    try {
      const urlObj = new URL(url.trim());
      return urlObj.toString();
    } catch (error) {
      // Return original if normalization fails
      return url;
    }
  }

  /**
   * Extract favicon URL from link URL
   * @param {string} url - Link URL
   * @returns {string} Favicon URL
   */
  extractFavicon(url) {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
    } catch (error) {
      return '';
    }
  }

  /**
   * Categorize link based on URL and content
   * @param {Object} link - Link to categorize
   * @returns {Array} Array of categories
   */
  categorizeLink(link) {
    const categories = [];
    const url = link.url || '';
    const title = (link.title || '').toLowerCase();
    const description = (link.description || '').toLowerCase();

    // Define category patterns
    const categoryPatterns = {
      'social': ['twitter.com', 'facebook.com', 'linkedin.com', 'instagram.com', 'reddit.com'],
      'development': ['github.com', 'stackoverflow.com', 'dev.to', 'medium.com', 'hackernoon.com'],
      'news': ['cnn.com', 'bbc.com', 'reuters.com', 'apnews.com', 'washingtonpost.com'],
      'video': ['youtube.com', 'vimeo.com', 'netflix.com', 'hulu.com', 'twitch.tv'],
      'shopping': ['amazon.com', 'ebay.com', 'etsy.com', 'shopify.com', 'aliexpress.com'],
      'documentation': ['docs.', 'documentation', 'api-docs', 'developer.', 'readthedocs.io'],
      'education': ['coursera.org', 'udemy.com', 'edx.org', 'khanacademy.org', 'mit.edu'],
      'tools': ['tools.', 'utility', 'converter', 'calculator', 'generator']
    };

    // Check URL patterns
    for (const [category, patterns] of Object.entries(categoryPatterns)) {
      if (patterns.some(pattern => url.includes(pattern))) {
        categories.push(category);
      }
    }

    // Check title and description patterns
    const textPatterns = {
      'tutorial': ['tutorial', 'guide', 'how to', 'learn', 'getting started'],
      'reference': ['documentation', 'reference', 'api', 'specs'],
      'blog': ['blog', 'post', 'article'],
      'news': ['news', 'breaking', 'update', 'announcement']
    };

    for (const [category, patterns] of Object.entries(textPatterns)) {
      if (patterns.some(pattern => title.includes(pattern) || description.includes(pattern))) {
        if (!categories.includes(category)) {
          categories.push(category);
        }
      }
    }

    return categories;
  }

  /**
   * Generate tags for link based on content analysis
   * @param {Object} link - Link to generate tags for
   * @returns {Array} Array of tag objects
   */
  generateTags(link) {
    const tags = [];
    const url = (link.url || '').toLowerCase();
    const title = (link.title || '').toLowerCase();
    const description = (link.description || '').toLowerCase();
    const existingTags = link.tags || [];

    // Extract from existing tags first
    const existingTagTitles = existingTags.map(t => t.title || t).filter(Boolean).map(t => t.toLowerCase());

    // Technology-related tags
    const techTags = {
      'javascript': ['javascript', 'js', 'node.js', 'react', 'vue', 'angular'],
      'python': ['python', 'django', 'flask', 'pandas', 'numpy'],
      'web-development': ['html', 'css', 'frontend', 'backend', 'fullstack'],
      'database': ['sql', 'mysql', 'postgresql', 'mongodb', 'redis'],
      'mobile': ['android', 'ios', 'react-native', 'flutter', 'cordova']
    };

    for (const [tag, keywords] of Object.entries(techTags)) {
      if (keywords.some(keyword =>
        url.includes(keyword) || title.includes(keyword) || description.includes(keyword)
      )) {
        if (!existingTagTitles.includes(tag)) {
          tags.push({ tagId: tag, title: tag.charAt(0).toUpperCase() + tag.slice(1) });
        }
      }
    }

    // Content type tags
    const contentTypeTags = {
      'video': ['youtube.com', 'vimeo.com', 'video', 'watch'],
      'documentation': ['docs.', 'documentation', 'api-docs', 'reference'],
      'tutorial': ['tutorial', 'guide', 'how-to', 'learn'],
      'tool': ['tool', 'utility', 'converter', 'generator', 'online']
    };

    for (const [tag, keywords] of Object.entries(contentTypeTags)) {
      if (keywords.some(keyword =>
        url.includes(keyword) || title.includes(keyword) || description.includes(keyword)
      )) {
        if (!existingTagTitles.includes(tag)) {
          tags.push({ tagId: tag, title: tag.charAt(0).toUpperCase() + tag.slice(1) });
        }
      }
    }

    return tags;
  }

  /**
   * Check if enrichment can be applied
   * @param {Array} links - Links to check
   * @param {Object} context - Processing context
   * @returns {boolean} True if enrichment can be applied
   */
  canProcess(links, context = {}) {
    if (!Array.isArray(links) || links.length === 0) {
      return false;
    }

    // Check if any links need enrichment
    return links.some(link => {
      return !link.title ||
             !link.favicon ||
             !link.categories ||
             !link.tags ||
             (link.url && !this.isValidUrl(link.url));
    });
  }

  /**
   * Get strategy capabilities
   * @returns {Object} Strategy capabilities
   */
  getCapabilities() {
    return {
      name: this.name,
      description: 'Enhances links with auto-generated titles, categories, tags, and metadata',
      supportedDataTypes: ['links'],
      configurableOptions: [
        'autoGenerateTitles',
        'extractFavicons',
        'fetchMetadata',
        'categorizeLinks',
        'validateUrls',
        'enrichTags',
        'generateDescriptions',
        'timeout',
        'maxRetries'
      ],
      outputFields: ['enrichedLinks', 'metadata', 'enrichmentStats']
    };
  }
}

module.exports = EnrichmentStrategy;