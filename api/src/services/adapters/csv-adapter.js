const DataAdapter = require('./data-adapter');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');

/**
 * CSV Adapter - Import/export links from/to CSV files
 * Users can upload CSV files or download their links as CSV
 */
class CsvAdapter extends DataAdapter {
  constructor(options = {}) {
    super('csv', options);
    this.delimiter = options.delimiter || ',';
    this.encoding = options.encoding || 'utf8';
    this.hasHeader = options.hasHeader !== false; // Default to true
  }

  async getLinks(filters = {}) {
    // For CSV adapter, "getLinks" means parse an uploaded CSV file
    const { filePath } = filters;

    if (!filePath) {
      throw new Error('filePath is required for CSV adapter');
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`CSV file not found: ${filePath}`);
    }

    try {
      const fileContent = fs.readFileSync(filePath, this.encoding);
      const records = parse(fileContent, {
        delimiter: this.delimiter,
        fromLine: this.hasHeader ? 2 : 1,
        skip_empty_lines: true,
        relax_column_count: true
      });

      const links = records.map(record => {
        // Handle different CSV column mappings
        const linkData = {
          id: record.id || record.linkId,
          title: record.title || record.name || record.url,
          url: record.url || record.link || record.href,
          description: record.description || record.notes || '',
          tags: record.tags ? record.tags.split(',').map(tag => tag.trim()) : [],
          favicon: record.favicon || record.icon || '',
          source: 'csv'
        };

        // Remove empty string properties
        Object.keys(linkData).forEach(key => {
          if (linkData[key] === '' || linkData[key] === null) {
            delete linkData[key];
          }
        });

        return linkData;
      }).filter(link => link.url); // Only include records with URLs

      return links.map(link => this.transformToLink(link));

    } catch (error) {
      throw new Error(`Failed to parse CSV file: ${error.message}`);
    }
  }

  async saveLinks(links) {
    const { filePath, includeHeader = true } = this.options;

    if (!filePath) {
      throw new Error('filePath is required for CSV export');
    }

    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Prepare CSV data
      const csvData = [];

      if (includeHeader) {
        csvData.push(['Title', 'URL', 'Description', 'Tags', 'Created', 'Source']);
      }

      for (const link of links) {
        const row = [
          link.title || '',
          link.url || '',
          link.description || '',
          link.tags ? link.tags.join(', ') : '',
          link.createdAt ? new Date(link.createdAt).toISOString().split('T')[0] : '',
          link.source || ''
        ];
        csvData.push(row);
      }

      // Convert to CSV string
      const csvContent = csvData.map(row =>
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(this.delimiter)
      ).join('\n');

      // Write to file
      fs.writeFileSync(filePath, csvContent, this.encoding);

      return {
        success: true,
        message: `Successfully exported ${links.length} links to CSV`,
        filePath: filePath
      };

    } catch (error) {
      throw new Error(`Failed to write CSV file: ${error.message}`);
    }
  }

  async testConnection() {
    // For CSV adapter, test means checking if we can read/write files
    try {
      const testFilePath = path.join(__dirname, '../../../temp/test.csv');

      // Test write
      const testData = [{ title: 'Test', url: 'https://example.com', tags: 'test' }];
      await this.saveLinks(testData, { filePath: testFilePath });

      // Test read
      const readLinks = await this.getLinks({ filePath: testFilePath });

      // Clean up
      fs.unlinkSync(testFilePath);

      return {
        status: 'success',
        message: 'CSV adapter working correctly',
        details: {
          delimiter: this.delimiter,
          encoding: this.encoding,
          hasHeader: this.hasHeader
        }
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'CSV adapter test failed',
        error: error.message
      };
    }
  }

  getCapabilities() {
    return {
      source: this.source,
      supportedFormats: ['csv'],
      features: ['import', 'export', 'custom_delimiter', 'header_support'],
      options: {
        delimiter: this.delimiter,
        encoding: this.encoding,
        hasHeader: this.hasHeader
      }
    };
  }
}

module.exports = CsvAdapter;