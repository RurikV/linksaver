const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { response } = require('../utils/response');

const DataManager = require('../services/data-manager');
const { validation } = require('../handlers/validation');

const router = express.Router();

// Initialize data manager
const dataManager = new DataManager();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Allow CSV files
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else if (file.mimetype === 'text/html' || file.originalname.endsWith('.html')) {
      cb(null, true); // For Chrome bookmarks export
    } else {
      cb(new Error('Only CSV and HTML files are supported'), false);
    }
  }
});

// Get available adapters
router.get('/', async (req, res) => {
  try {
    const adapters = dataManager.getAvailableAdapters();
    res.json({
      success: true,
      adapters,
      defaultAdapter: dataManager.getDefaultAdapter()
    });
  } catch (error) {
    console.error('Error getting adapters:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get links from specific adapter
router.get('/:adapterName/links', async (req, res) => {
  try {
    const { adapterName } = req.params;
    const filters = req.query;

    const links = await dataManager.getLinks(adapterName, filters);

    res.json({
      success: true,
      adapter: adapterName,
      links,
      count: links.length
    });
  } catch (error) {
    console.error('Error getting links from adapter:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test adapter connection
router.get('/:adapterName/test', async (req, res) => {
  try {
    const { adapterName } = req.params;
    const result = await dataManager.testAdapter(adapterName);
    res.json({
      success: true,
      adapter: adapterName,
      test: result
    });
  } catch (error) {
    console.error('Error testing adapter:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Import links from file (CSV, HTML)
router.post('/import/:sourceType', upload.single('file'), async (req, res) => {
  try {
    const { sourceType } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const filePath = req.file.path;

    // Add file path to import data
    const importData = {
      filePath,
      filters: req.query,
      sourceType
    };

    const result = await dataManager.importLinks(sourceType, importData);

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Error importing links:', error);

    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Export links to file
router.post('/export/:format', async (req, res) => {
  try {
    const { format } = req.params;
    const options = req.body || {};

    // Validate format
    if (format !== 'csv') {
      return res.status(400).json({
        success: false,
        error: 'Only CSV export is supported'
      });
    }

    const exportData = {
      filters: req.query,
      options: {
        ...options,
        filePath: `exports/links_${Date.now()}.csv`
      }
    };

    const result = await dataManager.exportLinks(format, exportData);

    if (result.success && result.filePath) {
      // Send file as download
      res.download(result.filePath, `links_export_${Date.now()}.csv`);
    } else {
      res.json({
        success: result.success,
        ...result
      });
    }

  } catch (error) {
    console.error('Error exporting links:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Import from Chrome bookmarks (JSON data)
router.post('/import/chrome-bookmarks', async (req, res) => {
  try {
    const { bookmarkData } = req.body;

    if (!bookmarkData) {
      return res.status(400).json({
        success: false,
        error: 'Chrome bookmark data is required'
      });
    }

    const importData = {
      bookmarkData,
      sourceType: 'chrome-bookmarks'
    };

    const result = await dataManager.importLinks('chrome-bookmarks', importData);

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Error importing Chrome bookmarks:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get adapter capabilities
router.get('/:adapterName/capabilities', async (req, res) => {
  try {
    const { adapterName } = req.params;
    const capabilities = dataManager.getAdapterCapabilities(adapterName);

    res.json({
      success: true,
      adapter: adapterName,
      capabilities
    });
  } catch (error) {
    console.error('Error getting adapter capabilities:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;