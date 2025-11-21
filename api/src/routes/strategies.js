const express = require('express');
const StrategyManager = require('../strategies/strategy-manager');

const router = express.Router();

// Initialize strategy manager (in production, this would be singleton)
const strategyManager = new StrategyManager();

// Get available strategies
router.get('/', async (req, res) => {
  try {
    const strategies = strategyManager.getAvailableStrategies();

    res.json({
      success: true,
      strategies,
      defaultStrategies: strategyManager.getDefaultStrategies()
    });

  } catch (error) {
    console.error('Error getting strategies:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Process data using strategies
router.post('/process', async (req, res) => {
  try {
    const { userId } = req;
    const { data, strategies, options = {} } = req.body;

    if (!Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        error: 'Data must be an array'
      });
    }

    const contextOptions = {
      userId,
      requestId: req.id,
      logger: console,
      ...options
    };

    const result = await strategyManager.processData(data, strategies, contextOptions);

    res.json({
      success: result.success,
      ...result,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Error processing data with strategies:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Process data with single strategy
router.post('/process/:strategyName', async (req, res) => {
  try {
    const { userId } = req;
    const { strategyName } = req.params;
    const { data, strategyOptions = {}, options = {} } = req.body;

    if (!Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        error: 'Data must be an array'
      });
    }

    const contextOptions = {
      userId,
      requestId: req.id,
      logger: console,
      ...options
    };

    const result = await strategyManager.processWithSingleStrategy(
      data,
      strategyName,
      strategyOptions,
      contextOptions
    );

    res.json({
      success: result.success,
      ...result,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Error processing data with single strategy:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test strategy on sample data
router.post('/test/:strategyName', async (req, res) => {
  try {
    const { strategyName } = req.params;
    const { data, strategyOptions = {} } = req.body;

    if (!Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        error: 'Sample data must be an array'
      });
    }

    const result = await strategyManager.testStrategy(strategyName, data, strategyOptions);

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Error testing strategy:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get strategy recommendations for data
router.post('/recommendations', async (req, res) => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        error: 'Data must be an array'
      });
    }

    const recommendations = strategyManager.getRecommendedStrategies(data);

    res.json({
      success: true,
      dataCount: data.length,
      recommendations
    });

  } catch (error) {
    console.error('Error getting strategy recommendations:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get default strategies
router.get('/defaults', async (req, res) => {
  try {
    const defaultStrategies = strategyManager.getDefaultStrategies();

    res.json({
      success: true,
      defaultStrategies
    });

  } catch (error) {
    console.error('Error getting default strategies:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Set default strategies
router.put('/defaults', async (req, res) => {
  try {
    const { strategies } = req.body;

    if (!Array.isArray(strategies)) {
      return res.status(400).json({
        success: false,
        error: 'Strategies must be an array'
      });
    }

    strategyManager.setDefaultStrategies(strategies);

    res.json({
      success: true,
      message: 'Default strategies updated successfully',
      defaultStrategies: strategyManager.getDefaultStrategies()
    });

  } catch (error) {
    console.error('Error setting default strategies:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Process links from database with strategies
router.post('/process-links', async (req, res) => {
  try {
    const { userId } = req;
    const { strategies, filters = {}, options = {} } = req.body;

    // Get links from database (using DataManager or Link model)
    const Link = require('../models/link');
    const query = { user: userId, ...filters };

    const links = await Link.find(query)
      .populate('tags')
      .sort({ createdAt: -1 })
      .lean();

    if (links.length === 0) {
      return res.json({
        success: true,
        message: 'No links found to process',
        originalCount: 0,
        processedCount: 0
      });
    }

    // Transform links to the format expected by strategies
    const linkData = links.map(link => ({
      linkId: link.linkId,
      title: link.title,
      url: link.url,
      description: link.description,
      tags: link.tags,
      source: link.source,
      metadata: link.metadata
    }));

    const contextOptions = {
      userId,
      requestId: req.id,
      logger: console,
      ...options
    };

    const result = await strategyManager.processData(linkData, strategies, contextOptions);

    // If processing was successful, update the links in database
    if (result.success && options.saveToDatabase !== false) {
      const updatedLinks = [];
      for (const processedLink of result.data) {
        if (processedLink.linkId) {
          await Link.findOneAndUpdate(
            { linkId: processedLink.linkId, user: userId },
            {
              $set: {
                title: processedLink.title,
                description: processedLink.description,
                tags: processedLink.tags,
                metadata: processedLink.metadata
              }
            },
            { new: true }
          );
          updatedLinks.push(processedLink.linkId);
        }
      }

      result.updatedInDatabase = updatedLinks.length;
    }

    res.json({
      success: result.success,
      originalCount: links.length,
      processedCount: result.data.length,
      ...result,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Error processing links with strategies:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;