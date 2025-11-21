/**
 * CMS Controller API Routes
 *
 * Provides backend support for the Universal CMS Dashboard:
 * - Component Registry API
 * - Page Builder API
 * - Plugin Management API
 * - Pipeline Processing API
 * - Real-time Component Updates
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// In-memory CMS framework instances (in production, these would be persistent)
const cmsInstances = new Map();
const componentRegistry = new Map();
const loadedPlugins = new Map();
const activePages = new Map();

// ==================== Component Registry API ====================

// Initialize component registry with built-in components
componentRegistry.set('link', {
  type: 'link',
  name: 'Link Component',
  description: 'Display saved links with actions',
  config: {
    showUrl: true,
    showDescription: true,
    showTags: true,
    showActions: true,
    target: '_blank'
  },
  category: 'content'
});

componentRegistry.set('container', {
  type: 'container',
  name: 'Container Component',
  description: 'Flexible layout container for organizing other components',
  config: {
    layout: 'vertical', // vertical, horizontal, grid
    spacing: 'medium',
    padding: true,
    border: false
  },
  category: 'layout'
});

componentRegistry.set('header', {
  type: 'header',
  name: 'Header Component',
  description: 'Page header with title and navigation',
  config: {
    level: 1,
    showSubtitle: true,
    centerText: false,
    borderBottom: true
  },
  category: 'layout'
});

componentRegistry.set('section', {
  type: 'section',
  name: 'Section Component',
  description: 'Content section container with optional title',
  config: {
    title: '',
    showTitle: true,
    collapsible: false,
    defaultExpanded: true
  },
  category: 'layout'
});

// Get all available components
router.get('/components', async (req, res) => {
  try {
    const components = Array.from(componentRegistry.values());

    res.json({
      success: true,
      data: components,
      total: components.length
    });
  } catch (error) {
    console.error('Error fetching components:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get specific component
router.get('/components/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const component = componentRegistry.get(type);

    if (!component) {
      return res.status(404).json({
        success: false,
        error: `Component type '${type}' not found`
      });
    }

    res.json({
      success: true,
      data: component
    });
  } catch (error) {
    console.error('Error fetching component:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Register new component type
router.post('/components', async (req, res) => {
  try {
    const { type, name, description, config, category } = req.body;

    if (!type || !name) {
      return res.status(400).json({
        success: false,
        error: 'Component type and name are required'
      });
    }

    if (componentRegistry.has(type)) {
      return res.status(409).json({
        success: false,
        error: `Component type '${type}' already exists`
      });
    }

    const component = {
      type,
      name,
      description: description || '',
      config: config || {},
      category: category || 'custom',
      registeredAt: new Date().toISOString()
    };

    componentRegistry.set(type, component);

    res.status(201).json({
      success: true,
      data: component,
      message: `Component '${type}' registered successfully`
    });
  } catch (error) {
    console.error('Error registering component:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== Page Builder API ====================

// Create a new page
router.post('/pages', async (req, res) => {
  try {
    const { title, components, metadata = {} } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Page title is required'
      });
    }

    const pageId = uuidv4();
    const page = {
      id: pageId,
      title,
      components: components || [],
      metadata: {
        ...metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };

    activePages.set(pageId, page);

    res.status(201).json({
      success: true,
      data: page,
      message: 'Page created successfully'
    });
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get page by ID
router.get('/pages/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    const page = activePages.get(pageId);

    if (!page) {
      return res.status(404).json({
        success: false,
        error: `Page '${pageId}' not found`
      });
    }

    res.json({
      success: true,
      data: page
    });
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// List all pages
router.get('/pages', async (req, res) => {
  try {
    const pages = Array.from(activePages.values());

    res.json({
      success: true,
      data: pages,
      total: pages.length
    });
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update page
router.put('/pages/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    const updates = req.body;

    const page = activePages.get(pageId);
    if (!page) {
      return res.status(404).json({
        success: false,
        error: `Page '${pageId}' not found`
      });
    }

    const updatedPage = {
      ...page,
      ...updates,
      id: pageId,
      metadata: {
        ...page.metadata,
        ...updates.metadata,
        updatedAt: new Date().toISOString()
      }
    };

    activePages.set(pageId, updatedPage);

    res.json({
      success: true,
      data: updatedPage,
      message: 'Page updated successfully'
    });
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete page
router.delete('/pages/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;

    if (!activePages.has(pageId)) {
      return res.status(404).json({
        success: false,
        error: `Page '${pageId}' not found`
      });
    }

    activePages.delete(pageId);

    res.json({
      success: true,
      message: 'Page deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== Plugin Management API ====================

// Initialize default plugins
const initializeDefaultPlugins = () => {
  const defaultPlugins = [
    {
      id: 'link-manager',
      name: 'Link Manager',
      version: '1.0.0',
      description: 'Manages link components and CRUD operations',
      status: 'active',
      dependencies: [],
      config: {
        maxLinksPerPage: 50,
        enableSorting: true,
        enableFiltering: true
      }
    },
    {
      id: 'theme-engine',
      name: 'Theme Engine',
      version: '2.1.0',
      description: 'Provides theming and styling capabilities',
      status: 'active',
      dependencies: [],
      config: {
        defaultTheme: 'default',
        customThemes: [],
        enableUserThemes: true
      }
    },
    {
      id: 'seo-optimizer',
      name: 'SEO Optimizer',
      version: '1.5.0',
      description: 'Optimizes pages for search engines',
      status: 'active',
      dependencies: [],
      config: {
        autoMeta: true,
        structuredData: true,
        sitemapGeneration: true
      }
    }
  ];

  defaultPlugins.forEach(plugin => {
    loadedPlugins.set(plugin.id, plugin);
  });
};

// Initialize plugins on startup
initializeDefaultPlugins();

// Get all loaded plugins
router.get('/plugins', async (req, res) => {
  try {
    const plugins = Array.from(loadedPlugins.values());

    res.json({
      success: true,
      data: plugins,
      total: plugins.length
    });
  } catch (error) {
    console.error('Error fetching plugins:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get specific plugin
router.get('/plugins/:pluginId', async (req, res) => {
  try {
    const { pluginId } = req.params;
    const plugin = loadedPlugins.get(pluginId);

    if (!plugin) {
      return res.status(404).json({
        success: false,
        error: `Plugin '${pluginId}' not found`
      });
    }

    res.json({
      success: true,
      data: plugin
    });
  } catch (error) {
    console.error('Error fetching plugin:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Load/activate plugin
router.post('/plugins/:pluginId/activate', async (req, res) => {
  try {
    const { pluginId } = req.params;
    const plugin = loadedPlugins.get(pluginId);

    if (!plugin) {
      return res.status(404).json({
        success: false,
        error: `Plugin '${pluginId}' not found`
      });
    }

    if (plugin.status === 'active') {
      return res.status(409).json({
        success: false,
        error: `Plugin '${pluginId}' is already active`
      });
    }

    // Simulate plugin activation
    plugin.status = 'active';
    plugin.activatedAt = new Date().toISOString();
    loadedPlugins.set(pluginId, plugin);

    res.json({
      success: true,
      data: plugin,
      message: `Plugin '${pluginId}' activated successfully`
    });
  } catch (error) {
    console.error('Error activating plugin:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Deactivate plugin
router.post('/plugins/:pluginId/deactivate', async (req, res) => {
  try {
    const { pluginId } = req.params;
    const plugin = loadedPlugins.get(pluginId);

    if (!plugin) {
      return res.status(404).json({
        success: false,
        error: `Plugin '${pluginId}' not found`
      });
    }

    if (plugin.status !== 'active') {
      return res.status(409).json({
        success: false,
        error: `Plugin '${pluginId}' is not active`
      });
    }

    // Simulate plugin deactivation
    plugin.status = 'inactive';
    plugin.deactivatedAt = new Date().toISOString();
    loadedPlugins.set(pluginId, plugin);

    res.json({
      success: true,
      data: plugin,
      message: `Plugin '${pluginId}' deactivated successfully`
    });
  } catch (error) {
    console.error('Error deactivating plugin:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== Pipeline Processing API ====================

// Execute pipeline
router.post('/pipeline/execute', async (req, res) => {
  try {
    const { operation, data, config = {} } = req.body;

    if (!operation) {
      return res.status(400).json({
        success: false,
        error: 'Operation is required'
      });
    }

    // Simulate pipeline execution
    const pipelineSteps = [
      { name: 'authentication', status: 'completed', duration: 15 },
      { name: 'validation', status: 'completed', duration: 8 },
      { name: 'processing', status: 'completed', duration: 45 },
      { name: 'rendering', status: 'completed', duration: 22 }
    ];

    const result = {
      success: true,
      operation,
      data,
      pipelineSteps,
      totalDuration: pipelineSteps.reduce((sum, step) => sum + step.duration, 0),
      timestamp: new Date().toISOString(),
      metadata: {
        processedAt: new Date().toISOString(),
        executionId: uuidv4(),
        config
      }
    };

    res.json({
      success: true,
      data: result,
      message: 'Pipeline executed successfully'
    });
  } catch (error) {
    console.error('Error executing pipeline:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get pipeline status
router.get('/pipeline/status', async (req, res) => {
  try {
    const status = {
      status: 'idle',
      lastExecution: null,
      totalExecutions: 0,
      successRate: 100,
      averageDuration: 90,
      activeMiddleware: ['authentication', 'validation', 'processing', 'rendering']
    };

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error fetching pipeline status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== Statistics API ====================

// Get CMS system statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      components: componentRegistry.size,
      plugins: loadedPlugins.size,
      pages: activePages.size,
      pipeline: {
        status: 'idle',
        lastExecution: new Date().toISOString()
      },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0'
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;