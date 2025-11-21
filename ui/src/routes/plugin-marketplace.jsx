/**
 * Plugin Marketplace - Plugin Architecture Demonstration
 *
 * Demonstrates:
 * - Plugin Pattern with dynamic loading
 * - Observer Pattern for plugin events
 * - Strategy Pattern for plugin execution
 * - Factory Pattern for plugin creation
 * - Registry Pattern for plugin management
 * - Extensible Architecture with real plugin ecosystem
 * - Plugin lifecycle management
 * - Plugin dependency resolution
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import styled from 'styled-components';

import { useApi } from '../hooks/use-api';
import Header from '../components/header';
import Button from '../components/button';
import Spinner from '../components/spinner';

// ==================== Styled Components ====================

const MarketplaceContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  padding: 20px;
`;

const MarketplaceContent = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const MarketplaceHeader = styled.div`
  background: #1e293b;
  color: white;
  padding: 30px;
  text-align: center;
`;

const MarketplaceTitle = styled.h1`
  font-size: 2.5em;
  margin-bottom: 10px;
  font-weight: 700;
`;

const MarketplaceSubtitle = styled.p`
  font-size: 1.1em;
  opacity: 0.9;
  margin: 0;
`;

const MarketplaceBody = styled.div`
  padding: 30px;
`;

const SectionTitle = styled.h2`
  font-size: 1.8em;
  color: #333;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PluginGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
`;

const PluginCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    border-color: #64748b;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const PluginHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
`;

const PluginName = styled.h3`
  font-size: 1.4em;
  color: #333;
  margin: 0;
  font-weight: 700;
`;

const PluginVersion = styled.span`
  background: #475569;
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.8em;
  font-weight: 600;
`;

const PluginDescription = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
`;

const PluginCategory = styled.span`
  background: #64748b;
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.8em;
  font-weight: 600;
  margin-right: 8px;
`;

const PluginActions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 20px;
`;

const PluginStatus = styled.span`
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.8em;
  font-weight: 600;
  margin-left: auto;

  ${props => props.$status === 'installed' && `
    background: #d4edda;
    color: #155724;
  `}

  ${props => props.$status === 'available' && `
    background: #cce5ff;
    color: #004085;
  `}

  ${props => props.$status === 'error' && `
    background: #f8d7da;
    color: #721c24;
  `}
`;

const DependencyList = styled.div`
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e2e8f0;
`;

const DependencyItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding: 8px;
  background: #f8fafc;
  border-radius: 6px;
  font-size: 0.9em;
`;

const EventLog = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
`;

const EventItem = styled.div`
  padding: 8px 12px;
  margin-bottom: 8px;
  border-radius: 6px;
  font-size: 0.9em;
  display: flex;
  align-items: center;
  gap: 8px;

  ${props => props.$type === 'load' && `
    background: #d4edda;
    color: #155724;
  `}

  ${props => props.$type === 'unload' && `
    background: #f8d7da;
    color: #721c24;
  `}

  ${props => props.$type === 'error' && `
    background: #fff3cd;
    color: #856404;
  `}

  ${props => props.$type === 'info' && `
    background: #cce5ff;
    color: #004085;
  `}
`;

const PluginStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 20px;
  background: #1e293b;
  color: white;
  border-radius: 8px;
  font-weight: 600;
`;

const StatNumber = styled.div`
  font-size: 2em;
  font-weight: 700;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 0.9em;
`;

// ==================== Plugin Framework Classes ====================

/**
 * Plugin Manager - Observer and Registry Patterns Implementation
 */
class PluginManager {
  constructor() {
    this.plugins = new Map();
    this.observers = [];
    this.eventLog = [];
    this.loadingPlugins = new Set();
    this.installedPlugins = new Set();
  }

  // Observer Pattern - Add observers
  addObserver(observer) {
    this.observers.push(observer);
  }

  // Observer Pattern - Notify observers
  notifyObservers(event, data) {
    const logEntry = { type: event, data, timestamp: Date.now() };
    this.eventLog.push(logEntry);
    this.observers.forEach(observer => {
      try {
        observer.update(event, data);
      } catch (error) {
        console.error('Observer error:', error);
      }
    });
  }

  // Registry Pattern - Register plugin
  registerPlugin(plugin) {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin ${plugin.id} already registered`);
    }

    this.plugins.set(plugin.id, plugin);
    this.notifyObservers('register', { plugin });
    return true;
  }

  // Plugin Lifecycle - Load plugin
  async loadPlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    if (this.loadingPlugins.has(pluginId)) {
      throw new Error(`Plugin ${pluginId} is already loading`);
    }

    this.loadingPlugins.add(pluginId);
    this.notifyObservers('load', { plugin });

    try {
      // Check dependencies
      await this.checkDependencies(plugin);

      // Initialize plugin
      await plugin.initialize();

      // Mark as installed
      this.installedPlugins.add(pluginId);

      this.notifyObservers('load-success', { plugin });
      return plugin;
    } catch (error) {
      this.notifyObservers('error', { plugin, error });
      throw error;
    } finally {
      this.loadingPlugins.delete(pluginId);
    }
  }

  // Plugin Lifecycle - Unload plugin
  async unloadPlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    this.notifyObservers('unload', { plugin });

    try {
      // Cleanup plugin
      if (typeof plugin.cleanup === 'function') {
        await plugin.cleanup();
      }

      // Remove from installed
      this.installedPlugins.delete(pluginId);

      this.notifyObservers('unload-success', { plugin });
      return true;
    } catch (error) {
      this.notifyObservers('error', { plugin, error });
      throw error;
    }
  }

  // Dependency Resolution
  async checkDependencies(plugin) {
    for (const dep of plugin.dependencies || []) {
      if (!this.installedPlugins.has(dep)) {
        try {
          await this.loadPlugin(dep);
        } catch (error) {
          throw new Error(`Dependency ${dep} failed to load: ${error.message}`);
        }
      }
    }
  }

  // Get plugin by ID
  getPlugin(pluginId) {
    return this.plugins.get(pluginId);
  }

  // Get all plugins
  getAllPlugins() {
    return Array.from(this.plugins.values());
  }

  // Get installed plugins
  getInstalledPlugins() {
    return Array.from(this.plugins.values()).filter(p =>
      this.installedPlugins.has(p.id)
    );
  }

  // Get event log
  getEventLog() {
    return this.eventLog;
  }

  // Factory Pattern - Create plugin instance
  createPlugin(config) {
    return new PluginInstance(config);
  }

  // Strategy Pattern - Execute plugin strategy
  async executeStrategy(strategyType, data) {
    const installedPlugins = this.getInstalledPlugins();
    const results = [];

    for (const plugin of installedPlugins) {
      if (plugin.supportsStrategy && plugin.supportsStrategy(strategyType)) {
        try {
          const result = await plugin.executeStrategy(strategyType, data);
          results.push({ plugin: plugin.id, result });
        } catch (error) {
          results.push({ plugin: plugin.id, error: error.message });
        }
      }
    }

    return results;
  }
}

/**
 * Plugin Instance - Base Plugin Class
 */
class PluginInstance {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.version = config.version;
    this.description = config.description;
    this.author = config.author;
    this.category = config.category;
    this.dependencies = config.dependencies || [];
    this.config = config.config || {};
    this.initialized = false;
  }

  async initialize() {
    // Override in subclasses
    this.initialized = true;
  }

  async cleanup() {
    // Override in subclasses
    this.initialized = false;
  }

  supportsStrategy(strategyType) {
    return false; // Override in subclasses
  }

  async executeStrategy(strategyType, data) {
    if (!this.initialized) {
      throw new Error(`Plugin ${this.id} not initialized`);
    }
    // Override in subclasses
    return data;
  }
}

// ==================== React Component ====================

const PluginMarketplace = () => {
  const navigate = useNavigate();
  const { getRequest, postRequest } = useApi();

  // State management
  const [loading, setLoading] = useState(true);
  const [plugins, setPlugins] = useState([]);
  const [installedPlugins, setInstalledPlugins] = useState(new Set());
  const [pluginManager, setPluginManager] = useState(null);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    installed: 0,
    categories: 0,
    events: 0
  });

  // Plugin observer for event logging
  const pluginObserver = useMemo(() => ({
    update: (eventType, data) => {
      const newEvent = {
        type: eventType,
        data: data,
        timestamp: new Date().toISOString()
      };

      setEvents(prev => [newEvent, ...prev].slice(0, 50)); // Keep last 50 events

      // Update stats
      if (eventType === 'load-success') {
        setInstalledPlugins(prev => new Set([...prev, data.plugin.id]));
      } else if (eventType === 'unload-success') {
        setInstalledPlugins(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.plugin.id);
          return newSet;
        });
      }
    }
  }), []);

  // Initialize plugin manager on mount
  useEffect(() => {
    initializePluginManager();
    loadAvailablePlugins();
  }, []);

  const initializePluginManager = () => {
    const manager = new PluginManager();
    manager.addObserver(pluginObserver);
    setPluginManager(manager);
  };

  const loadAvailablePlugins = async () => {
    try {
      // Load plugins from API
      const response = await getRequest('/cms-controller/plugins');
      if (response.data?.data) {
        const apiPlugins = response.data.data;

        // Create plugin instances
        const pluginInstances = apiPlugins.map(pluginData => {
          const plugin = pluginManager.createPlugin({
            ...pluginData,
            id: pluginData.id || pluginData.name.toLowerCase().replace(/\s+/g, '-'),
            category: pluginData.category || 'general'
          });
          return plugin;
        });

        // Register plugins
        pluginInstances.forEach(plugin => {
          pluginManager.registerPlugin(plugin);
        });

        setPlugins(pluginInstances);

        // Set initial installed plugins
        const installedIds = apiPlugins
          .filter(p => p.status === 'active')
          .map(p => p.id || p.name.toLowerCase().replace(/\s+/g, '-'));

        setInstalledPlugins(new Set(installedIds));
      }

      // Load additional demo plugins
      loadDemoPlugins();

    } catch (error) {
      console.error('Failed to load plugins:', error);
      toast.error('Failed to load plugins');
    } finally {
      setLoading(false);
    }
  };

  const loadDemoPlugins = () => {
    // Create demonstration plugins showing different patterns
    const demoPlugins = [
      {
        id: 'link-enhancer',
        name: 'Link Enhancer',
        version: '2.0.0',
        description: 'Enhances link components with rich metadata and social media integration',
        author: 'CMS Team',
        category: 'enhancement',
        dependencies: [],
        config: {
          enableSocial: true,
          enableMetadata: true,
          enableAnalytics: true
        },
        supportsStrategy: ['process-link', 'enhance-content']
      },
      {
        id: 'theme-customizer',
        name: 'Theme Customizer',
        version: '3.1.0',
        description: 'Advanced theming system with live preview and user themes',
        author: 'Design Team',
        category: 'appearance',
        dependencies: [],
        config: {
          livePreview: true,
          userThemes: true,
          cssVariables: true
        },
        supportsStrategy: ['apply-theme', 'generate-styles']
      },
      {
        id: 'seo-optimizer',
        name: 'SEO Optimizer Pro',
        version: '1.5.0',
        description: 'Comprehensive SEO optimization with structured data and meta tags',
        author: 'Marketing Team',
        category: 'optimization',
        dependencies: ['link-enhancer'],
        config: {
          autoMeta: true,
          structuredData: true,
          sitemap: true,
          analytics: true
        },
        supportsStrategy: ['optimize-seo', 'generate-meta']
      },
      {
        id: 'content-analyzer',
        name: 'Content Analyzer',
        version: '1.0.0',
        description: 'AI-powered content analysis and recommendations',
        author: 'AI Team',
        category: 'analytics',
        dependencies: [],
        config: {
          aiAnalysis: true,
          readability: true,
          sentiment: true
        },
        supportsStrategy: ['analyze-content', 'recommend-improvements']
      },
      {
        id: 'performance-booster',
        name: 'Performance Booster',
        version: '2.0.0',
        description: 'Advanced caching and optimization for lightning-fast loading',
        author: 'Performance Team',
        category: 'performance',
        dependencies: [],
        config: {
          caching: true,
          lazyLoading: true,
          optimization: true
        },
        supportsStrategy: ['optimize-performance', 'cache-content']
      }
    ];

    const demoPluginInstances = demoPlugins.map(config => {
      const plugin = pluginManager.createPlugin(config);

      // Add plugin methods for demonstration
      plugin.initialize = async () => {
        console.log(`Initializing plugin: ${plugin.name}`);
        return new Promise(resolve => setTimeout(resolve, 1000));
      };

      plugin.cleanup = async () => {
        console.log(`Cleaning up plugin: ${plugin.name}`);
        return new Promise(resolve => setTimeout(resolve, 500));
      };

      plugin.supportsStrategy = (strategyType) => {
        return config.supportsStrategy?.includes(strategyType) || false;
      };

      plugin.executeStrategy = async (strategyType, data) => {
        console.log(`Executing ${strategyType} with plugin: ${plugin.name}`);

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 500));

        return {
          plugin: plugin.id,
          strategy: strategyType,
          processed: true,
          timestamp: Date.now()
        };
      };

      return plugin;
    });

    // Register demo plugins
    demoPluginInstances.forEach(plugin => {
      pluginManager.registerPlugin(plugin);
    });

    setPlugins(prev => [...prev, ...demoPluginInstances]);
  };

  // Plugin actions
  const installPlugin = async (pluginId) => {
    if (!pluginManager) return;

    try {
      await pluginManager.loadPlugin(pluginId);
      toast.success(`Plugin ${pluginId} installed successfully!`);
    } catch (error) {
      console.error('Plugin installation failed:', error);
      toast.error(`Failed to install plugin: ${error.message}`);
    }
  };

  const uninstallPlugin = async (pluginId) => {
    if (!pluginManager) return;

    try {
      await pluginManager.unloadPlugin(pluginId);
      toast.success(`Plugin ${pluginId} uninstalled successfully!`);
    } catch (error) {
      console.error('Plugin uninstallation failed:', error);
      toast.error(`Failed to uninstall plugin: ${error.message}`);
    }
  };

  const demonstratePluginStrategy = async (strategyType) => {
    if (!pluginManager) return;

    try {
      const results = await pluginManager.executeStrategy(strategyType, {
        timestamp: Date.now(),
        source: 'plugin-marketplace'
      });

      const successCount = results.filter(r => !r.error).length;
      toast.success(`Strategy executed on ${successCount} plugins!`);
    } catch (error) {
      console.error('Strategy execution failed:', error);
      toast.error('Failed to execute strategy');
    }
  };

  // Update stats when plugins change
  useEffect(() => {
    if (plugins.length > 0) {
      const categories = new Set(plugins.map(p => p.category));
      setStats({
        total: plugins.length,
        installed: installedPlugins.size,
        categories: categories.size,
        events: events.length
      });
    }
  }, [plugins, installedPlugins, events]);

  const isPluginInstalled = (pluginId) => {
    return installedPlugins.has(pluginId);
  };

  const getPluginStatus = (pluginId) => {
    return isPluginInstalled(pluginId) ? 'installed' : 'available';
  };

  const renderPluginCard = (plugin) => {
    const status = getPluginStatus(plugin.id);
    const isInstalled = isPluginInstalled(plugin.id);

    return (
      <PluginCard key={plugin.id}>
        <PluginHeader>
          <PluginName>{plugin.name}</PluginName>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PluginVersion>{plugin.version}</PluginVersion>
            <PluginStatus $status={status}>
              {isInstalled ? 'Installed' : 'Available'}
            </PluginStatus>
          </div>
        </PluginHeader>

        <PluginDescription>{plugin.description}</PluginDescription>

        <div style={{ marginBottom: '15px' }}>
          <PluginCategory>{plugin.category}</PluginCategory>
          <span style={{ fontSize: '0.9em', color: '#666' }}>
            by {plugin.author}
          </span>
        </div>

        {plugin.dependencies && plugin.dependencies.length > 0 && (
          <DependencyList>
            <strong>Dependencies:</strong>
            {plugin.dependencies.map(dep => (
              <DependencyItem key={dep}>
                {dep}
                {isPluginInstalled(dep) ? ' (Installed)' : ' (Available)'}
              </DependencyItem>
            ))}
          </DependencyList>
        )}

        <PluginActions>
          {isInstalled ? (
            <>
              <Button
                onClick={() => demonstratePluginStrategy('process-link')}
                style={{
                  background: '#475569',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  fontSize: '0.9em',
                  borderRadius: '6px'
                }}
              >
                Test Strategy
              </Button>
              <Button
                onClick={() => uninstallPlugin(plugin.id)}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  fontSize: '0.9em',
                  borderRadius: '6px'
                }}
              >
                Uninstall
              </Button>
            </>
          ) : (
            <Button
              onClick={() => installPlugin(plugin.id)}
              style={{
                background: '#475569',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                fontSize: '0.9em',
                borderRadius: '6px'
              }}
            >
              Install Plugin
            </Button>
          )}
        </PluginActions>
      </PluginCard>
    );
  };

  const renderEventLog = () => {
    if (events.length === 0) {
      return (
        <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
          No plugin events yet. Install or uninstall plugins to see events.
        </div>
      );
    }

    return events.map((event, index) => (
      <EventItem key={index} $type={event.type}>
        <strong>{event.type.toUpperCase()}</strong>
        <span>{JSON.stringify(event.data.plugin?.name || event.data)}</span>
        <small>{new Date(event.timestamp).toLocaleTimeString()}</small>
      </EventItem>
    ));
  };

  if (loading) {
    return (
      <MarketplaceContainer>
        <Header />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Spinner size="large" />
        </div>
      </MarketplaceContainer>
    );
  }

  return (
    <MarketplaceContainer>
      <Header />
      <MarketplaceContent>
        <MarketplaceHeader>
          <MarketplaceTitle>Plugin Marketplace</MarketplaceTitle>
          <MarketplaceSubtitle>
            Dynamic Plugin Architecture with Observer, Factory, and Strategy Patterns
          </MarketplaceSubtitle>
        </MarketplaceHeader>

        <MarketplaceBody>
          {/* Plugin Statistics */}
          <SectionTitle>Plugin Statistics</SectionTitle>
          <PluginStats>
            <StatCard>
              <StatNumber>{stats.total}</StatNumber>
              <StatLabel>Total Plugins</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{stats.installed}</StatNumber>
              <StatLabel>Installed</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{stats.categories}</StatNumber>
              <StatLabel>Categories</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{stats.events}</StatNumber>
              <StatLabel>Events Logged</StatLabel>
            </StatCard>
          </PluginStats>

          {/* Plugin Grid */}
          <SectionTitle>Available Plugins</SectionTitle>
          <PluginGrid>
            {plugins.map(renderPluginCard)}
          </PluginGrid>

          {/* Event Log */}
          <SectionTitle>Plugin Event Log</SectionTitle>
          <EventLog>
            {renderEventLog()}
          </EventLog>
        </MarketplaceBody>
      </MarketplaceContent>
    </MarketplaceContainer>
  );
};

export default PluginMarketplace;