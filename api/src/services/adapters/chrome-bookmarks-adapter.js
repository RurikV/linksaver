const DataAdapter = require('./data-adapter');

/**
 * Chrome Bookmarks Adapter - Import bookmarks from Chrome browser
 * Uses Chrome's native bookmarks API for direct access
 */
class ChromeBookmarksAdapter extends DataAdapter {
  constructor(options = {}) {
    super('chrome-bookmarks', options);
    this.includeFolders = options.includeFolders || false;
    this.includeFavicons = options.includeFavicons !== false;
  }

  async getLinks(filters = {}) {
    try {
      // This would typically be called from a browser extension
      // For API access, we'll expect bookmark data to be passed in
      const { bookmarkData } = filters;

      if (!bookmarkData) {
        throw new Error('Chrome bookmark data is required. Use Chrome extension to export bookmarks.');
      }

      const links = this.parseChromeBookmarks(bookmarkData);
      return links.map(link => this.transformToLink(link));

    } catch (error) {
      throw new Error(`Failed to process Chrome bookmarks: ${error.message}`);
    }
  }

  parseChromeBookmarks(bookmarks) {
    const links = [];

    const processNode = (node, path = '') => {
      if (node.url && node.url.startsWith('http')) {
        const linkData = {
          id: node.id,
          title: node.title || this.extractTitleFromUrl(node.url),
          url: node.url,
          description: node.description || '',
          tags: this.extractTagsFromPath(path),
          favicon: this.includeFavicons ? `https://www.google.com/s2/favicons?domain_url=${node.url}` : '',
          source: 'chrome-bookmarks',
          metadata: {
            dateAdded: node.dateAdded ? new Date(node.dateAdded).toISOString() : null,
            folderPath: path,
            faviconUrl: node.url
          }
        };

        links.push(linkData);
      }

      // Process child nodes (folders)
      if (node.children && Array.isArray(node.children)) {
        const currentPath = path ? `${path}/${node.title}` : node.title;
        node.children.forEach(child => processNode(child, currentPath));
      }
    };

    if (Array.isArray(bookmarks)) {
      bookmarks.forEach(node => processNode(node));
    } else if (bookmarks && bookmarks.children) {
      processNode(bookmarks);
    }

    return links;
  }

  extractTitleFromUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch (error) {
      return 'Untitled';
    }
  }

  extractTagsFromPath(path) {
    if (!path || !this.includeFolders) return [];

    // Extract folder names as tags
    return path
      .split('/')
      .filter(folder => folder.trim())
      .filter(folder => folder.length > 0)
      .map(folder => folder.toLowerCase());
  }

  async saveLinks(links) {
    // Chrome bookmarks are read-only
    throw new Error('Chrome Bookmarks adapter is read-only. Links cannot be saved to Chrome bookmarks through this adapter.');
  }

  async testConnection() {
    // Check if we're running in a Chrome extension context
    const isChromeExtension = typeof chrome !== 'undefined' && chrome.bookmarks;

    return {
      status: isChromeExtension ? 'success' : 'warning',
      message: isChromeExtension
        ? 'Chrome Bookmarks adapter is ready'
        : 'Chrome Bookmarks adapter requires Chrome extension context',
      details: {
        chromeExtension: isChromeExtension,
        includeFolders: this.includeFolders,
        includeFavicons: this.includeFavicons,
        note: 'Use Chrome extension to export bookmarks'
      },
      instructions: !isChromeExtension ? [
        'Install Chrome extension to access bookmarks',
        'Export bookmarks using Chrome\'s bookmark manager',
        'Upload the exported HTML file'
      ] : []
    };
  }

  getCapabilities() {
    return {
      source: this.source,
      supportedFormats: ['html', 'json'],
      features: ['read_only', 'folder_support', 'favicon_support', 'tag_extraction'],
      options: {
        includeFolders: this.includeFolders,
        includeFavicons: this.includeFavicons
      },
      usage: {
        extension: 'Use Chrome extension for direct access',
        export: 'Export bookmarks from Chrome Bookmark Manager',
        security: 'Chrome bookmarks are read-only'
      }
    };
  }
}

module.exports = ChromeBookmarksAdapter;