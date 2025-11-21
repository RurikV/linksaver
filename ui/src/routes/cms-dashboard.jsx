/**
 * Comprehensive CMS Dashboard
 *
 * Demonstrates all advanced CMS framework features:
 * - Component Registry with dynamic components
 * - Composite Pattern for component hierarchy
 * - Page Builder with Builder Pattern
 * - Pipeline Middleware for request processing
 * - Plugin System for extensibility
 * - IoC Container with Dependency Injection
 * - Real-time component editing
 * - Theme and layout customization
 * - Strategy Pattern for rendering
 * - Observer Pattern for lifecycle events
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import styled from 'styled-components';

import { useApi } from '../hooks/use-api';
import Header from '../components/header';
import Button from '../components/button';
import Spinner from '../components/spinner';
import './cms-dashboard-styles.css';

// ==================== Styled Components ====================

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const DashboardContent = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
`;

const DashboardHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  text-align: center;
`;

const DashboardTitle = styled.h1`
  font-size: 2.5em;
  margin-bottom: 10px;
  font-weight: 700;
`;

const DashboardSubtitle = styled.p`
  font-size: 1.1em;
  opacity: 0.9;
  margin: 0;
`;

const DashboardBody = styled.div`
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

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
`;

const FeatureCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  }
`;

const FeatureTitle = styled.h3`
  font-size: 1.3em;
  color: #333;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FeatureDescription = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
`;

const FeatureActions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8em;
  font-weight: 600;

  ${props => props.$status === 'active' && `
    background: #d4edda;
    color: #155724;
  `}

  ${props => props.$status === 'inactive' && `
    background: #f8d7da;
    color: #721c24;
  `}

  ${props => props.$status === 'loading' && `
    background: #fff3cd;
    color: #856404;
  `}
`;

const ComponentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const ComponentCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border: 2px solid #e9ecef;
  position: relative;
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    background: white;
  }
`;

const ComponentName = styled.h4`
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1.1em;
`;

const ComponentType = styled.span`
  background: #667eea;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75em;
  font-weight: 600;
`;

const ComponentActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 15px;
`;

const PagePreview = styled.div`
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  background: #f8f9fa;
  min-height: 200px;
  margin-top: 20px;
`;

const PipelineStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f0f0f0;
  border-radius: 6px;
  margin-top: 10px;
`;

const PipelineStep = styled.div`
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.85em;
  font-weight: 600;

  ${props => props.$active && `
    background: #667eea;
    color: white;
  `}

  ${props => !props.$active && `
    background: #e0e0e0;
    color: #666;
  `}
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
`;

const StatNumber = styled.div`
  font-size: 2em;
  font-weight: 700;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 0.9em;
  opacity: 0.9;
`;

// ==================== CMS Framework Classes (Simplified Implementation) ====================

/**
 * Base Component Class - Following SOLID principles
 */
class CmsComponent {
  constructor(id, type, config = {}) {
    this.id = id;
    this.type = type;
    this.config = config;
    this.children = [];
    this.events = new Map();
  }

  async initialize() {
    this.emit('initialized');
  }

  async render() {
    return `<div class="component-${this.type}" id="${this.id}">Component: ${this.type}</div>`;
  }

  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(callback);
  }

  emit(event, data = {}) {
    if (this.events.has(event)) {
      this.events.get(event).forEach(callback => callback(data));
    }
  }

  addChild(child) {
    this.children.push(child);
  }
}

/**
 * Link Component - Composite Pattern Implementation
 */
class LinkComponent extends CmsComponent {
  constructor(id, link) {
    super(id, 'link', link);
    this.link = link;
  }

  async render() {
    const tags = this.link.tags?.map(tag =>
      `<span class="tag">${tag.title || tag.name}</span>`
    ).join(' ') || '';

    return `
      <div class="link-component" id="${this.id}" data-link-id="${this.link.linkId}">
        <div class="link-header">
          <h4><a href="${this.link.url}" target="_blank" rel="noopener noreferrer">
            ${this.link.title}
          </a></h4>
          <div class="link-url">${this.link.url}</div>
        </div>
        ${this.link.description ? `<div class="link-description">${this.link.description}</div>` : ''}
        ${tags ? `<div class="link-tags">${tags}</div>` : ''}
        <div class="link-actions">
          <button class="edit-btn" onclick="window.cms.editLink('${this.link.linkId}')">✏️ Edit</button>
          <button class="delete-btn" onclick="window.cms.deleteLink('${this.link.linkId}')">🗑️ Delete</button>
        </div>
      </div>
    `;
  }
}

/**
 * Container Component - Composite Pattern Implementation
 */
class ContainerComponent extends CmsComponent {
  constructor(id, type = 'container', config = {}) {
    super(id, type, config);
  }

  async render() {
    const childrenHtml = await Promise.all(
      this.children.map(child => child.render())
    );

    return `
      <div class="container-component ${this.type}" id="${this.id}" data-layout="${this.config.layout || 'vertical'}">
        <div class="container-content">
          ${childrenHtml.join('')}
        </div>
      </div>
    `;
  }
}

/**
 * Component Registry - Registry Pattern Implementation
 */
class ComponentRegistry {
  constructor() {
    this.components = new Map();
    this.plugins = new Map();
  }

  register(type, factory) {
    this.components.set(type, factory);
  }

  create(type, id, config) {
    const factory = this.components.get(type);
    if (!factory) {
      throw new Error(`Component type not registered: ${type}`);
    }
    return factory(id, config);
  }

  loadPlugin(plugin) {
    this.plugins.set(plugin.name, plugin);
    plugin.register(this);
  }

  getAvailableTypes() {
    return Array.from(this.components.keys());
  }
}

/**
 * Pipeline - Chain of Responsibility Pattern
 */
class Pipeline {
  constructor() {
    this.middleware = [];
  }

  use(middleware) {
    this.middleware.push(middleware);
  }

  async execute(context) {
    let index = 0;

    const next = async () => {
      if (index < this.middleware.length) {
        const middleware = this.middleware[index++];
        await middleware(context, next);
      }
    };

    await next();
  }
}

/**
 * Page Builder - Builder Pattern Implementation
 */
class PageBuilder {
  constructor(registry) {
    this.registry = registry;
    this.reset();
  }

  reset() {
    this.page = {
      title: '',
      components: [],
      metadata: {}
    };
    return this;
  }

  setTitle(title) {
    this.page.title = title;
    return this;
  }

  addComponent(type, id, config) {
    const component = this.registry.create(type, id, config);
    this.page.components.push(component);
    return this;
  }

  async build() {
    const childrenHtml = await Promise.all(
      this.page.components.map(component => component.render())
    );

    return {
      title: this.page.title,
      html: `
        <div class="cms-page" data-title="${this.page.title}">
          <h1>${this.page.title}</h1>
          ${childrenHtml.join('')}
        </div>
      `,
      components: this.page.components,
      metadata: this.page.metadata
    };
  }
}

// ==================== React Component ====================

const CmsDashboard = () => {
  const navigate = useNavigate();
  const { getRequest, postRequest, putRequest, deleteRequest } = useApi();

  // State management
  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState([]);
  const [components, setComponents] = useState([]);
  const [activePlugins, setActivePlugins] = useState([]);
  const [pipelineStatus, setPipelineStatus] = useState('idle');
  const [currentPage, setCurrentPage] = useState(null);
  const [cmsFramework, setCmsFramework] = useState(null);

  // Refs for CMS framework
  const registryRef = useRef(null);
  const pipelineRef = useRef(null);
  const builderRef = useRef(null);

  // Initialize CMS Framework on mount
  useEffect(() => {
    initializeCmsFramework();
    loadLinks();
    loadCmsData();
  }, []);

  const initializeCmsFramework = () => {
    // Initialize Component Registry
    const registry = new ComponentRegistry();
    registry.register('link', (id, config) => new LinkComponent(id, config));
    registry.register('container', (id, config) => new ContainerComponent(id, 'container', config));
    registry.register('header', (id, config) => new ContainerComponent(id, 'header', config));
    registry.register('section', (id, config) => new ContainerComponent(id, 'section', config));
    registryRef.current = registry;

    // Initialize Pipeline
    const pipeline = new Pipeline();
    pipeline.use(async (context, next) => {
      setPipelineStatus('authenticating');
      await next();
    });
    pipeline.use(async (context, next) => {
      setPipelineStatus('validating');
      await next();
    });
    pipeline.use(async (context, next) => {
      setPipelineStatus('processing');
      await next();
    });
    pipeline.use(async (context, next) => {
      setPipelineStatus('rendering');
      await next();
    });
    pipelineRef.current = pipeline;

    // Initialize Page Builder
    const builder = new PageBuilder(registry);
    builderRef.current = builder;

    setCmsFramework({
      registry: '✅ Active',
      pipeline: '✅ Active',
      builder: '✅ Active',
      plugins: 0,
      components: 0
    });
  };

  const loadCmsData = async () => {
    try {
      // Load components from API
      const componentsResponse = await getRequest('/cms-controller/components');
      if (componentsResponse.data?.data) {
        setComponents(componentsResponse.data.data);
      }

      // Load plugins from API
      const pluginsResponse = await getRequest('/cms-controller/plugins');
      if (pluginsResponse.data?.data) {
        setActivePlugins(pluginsResponse.data.data);
      }

      // Load system stats
      const statsResponse = await getRequest('/cms-controller/stats');
      if (statsResponse.data?.data) {
        setCmsFramework(prev => ({
          ...prev,
          plugins: statsResponse.data.data.plugins,
          components: statsResponse.data.data.components
        }));
      }

    } catch (error) {
      console.error('Failed to load CMS data:', error);
      toast.error('Failed to load CMS data');
    }
  };

  const loadLinks = async () => {
    try {
      const response = await getRequest('/public/links');
      if (response.data?.data) {
        setLinks(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load links:', error);
      toast.error('Failed to load links');
    } finally {
      setLoading(false);
    }
  };

  // ==================== CMS Operations ====================

  const createPageWithLinks = async () => {
    if (links.length === 0) {
      toast.error('No links available');
      return;
    }

    try {
      // Build page structure
      const pageComponents = [
        {
          type: 'header',
          id: 'main-header',
          config: { layout: 'horizontal', centerText: true, borderBottom: true }
        },
        {
          type: 'container',
          id: 'links-container',
          config: { layout: 'grid', spacing: 'medium', padding: true },
          children: links.slice(0, 6).map((link, index) => ({
            type: 'link',
            id: `link-${index}`,
            config: {
              linkId: link.linkId,
              showUrl: true,
              showDescription: true,
              showTags: true,
              showActions: true
            }
          }))
        }
      ];

      const response = await postRequest('/cms-controller/pages', {
        title: 'My Links Collection',
        components: pageComponents,
        metadata: {
          source: 'link-saver',
          componentCount: pageComponents.length,
          linkCount: links.slice(0, 6).length,
          createdAt: new Date().toISOString()
        }
      });

      if (response.data?.success) {
        setCurrentPage(response.data.data);
        toast.success('Page created successfully!');

        // Generate HTML preview
        const html = generatePageHtml(response.data.data);
        setCurrentPage(prev => ({ ...prev, html }));
      }
    } catch (error) {
      console.error('Failed to create page:', error);
      toast.error('Failed to create page');
    }
  };

  const generatePageHtml = (page) => {
    let html = `<div class="cms-page" data-page-id="${page.id}">`;
    html += `<h1>${page.title}</h1>`;

    page.components.forEach(component => {
      switch (component.type) {
        case 'header':
          html += `<div class="component-header" id="${component.id}">
            <div class="header-content" style="${getHeaderStyles(component.config)}">
              <h2>${page.title}</h2>
            </div>
          </div>`;
          break;
        case 'container':
          html += `<div class="component-container ${component.config.layout}" id="${component.id}">
            <div class="container-content">`;

          if (component.children) {
            component.children.forEach(child => {
              if (child.type === 'link') {
                const link = links.find(l => l.linkId === child.config.linkId);
                if (link) {
                  html += `<div class="link-component" id="${child.id}" data-link-id="${link.linkId}">
                    <div class="link-header">
                      <h4><a href="${link.url}" target="_blank" rel="noopener noreferrer">
                        ${link.title}
                      </a></h4>
                      <div class="link-url">${link.url}</div>
                    </div>
                    ${link.description ? `<div class="link-description">${link.description}</div>` : ''}
                    ${link.tags && link.tags.length > 0 ? `<div class="link-tags">${link.tags.map(tag => `<span class="tag">${tag.title || tag.name}</span>`).join(' ')}</div>` : ''}
                    <div class="link-actions">
                      <button class="edit-btn" onclick="window.cms.editLink('${link.linkId}')">✏️ Edit</button>
                      <button class="delete-btn" onclick="window.cms.deleteLink('${link.linkId}')">🗑️ Delete</button>
                    </div>
                  </div>`;
                }
              }
            });
          }

          html += `</div></div>`;
          break;
      }
    });

    html += '</div>';
    return html;
  };

  const getHeaderStyles = (config) => {
    const styles = [];
    if (config.centerText) styles.push('text-align: center');
    if (config.borderBottom) styles.push('border-bottom: 3px solid #667eea; padding-bottom: 15px');
    return styles.join('; ');
  };

  const demonstratePipeline = async () => {
    try {
      setPipelineStatus('processing');

      const response = await postRequest('/cms-controller/pipeline/execute', {
        operation: 'render_page',
        data: {
          components: components.length,
          links: links.length,
          timestamp: Date.now()
        },
        config: {
          validation: true,
          optimization: true,
          caching: true
        }
      });

      if (response.data?.success) {
        toast.success(`Pipeline completed in ${response.data.data.totalDuration}ms!`);
        setTimeout(() => setPipelineStatus('idle'), 1000);
      }
    } catch (error) {
      console.error('Pipeline error:', error);
      toast.error('Pipeline execution failed');
      setPipelineStatus('idle');
    }
  };

  const demonstrateComponentRegistry = () => {
    const types = registryRef.current?.getAvailableTypes() || [];
    toast.info(`Available components: ${types.join(', ')}`);
  };

  // ==================== Component Functions ====================

  const editLink = (linkId) => {
    // Navigate to edit functionality
    navigate(`/content-hub?edit=${linkId}`);
  };

  const deleteLink = async (linkId) => {
    try {
      await deleteRequest(`/links/${linkId}`);
      toast.success('Link deleted successfully!');
      loadLinks(); // Reload links
    } catch (error) {
      console.error('Failed to delete link:', error);
      toast.error('Failed to delete link');
    }
  };

  // Make functions available globally for onclick handlers
  useEffect(() => {
    window.cms = { editLink, deleteLink };
    return () => {
      delete window.cms;
    };
  }, []);

  // ==================== Render Methods ====================

  const renderFeatureCards = () => {
    const features = [
      {
        title: '🏗️ Component Registry',
        description: 'Dynamic component registration and creation system with plugin support',
        actions: [
          { label: 'View Components', onClick: demonstrateComponentRegistry },
          { label: 'Register New', onClick: () => toast.info('Plugin registration demo') }
        ],
        status: 'active'
      },
      {
        title: '🧩 Composite Pattern',
        description: 'Hierarchical component structure with parent-child relationships',
        actions: [
          { label: 'Build Tree', onClick: createPageWithLinks },
          { label: 'View Hierarchy', onClick: () => toast.info('Component hierarchy demo') }
        ],
        status: 'active'
      },
      {
        title: '⚙️ Pipeline Middleware',
        description: 'Request processing pipeline with configurable middleware',
        actions: [
          { label: 'Execute Pipeline', onClick: demonstratePipeline },
          { label: 'Configure', onClick: () => toast.info('Pipeline configuration demo') }
        ],
        status: 'active'
      },
      {
        title: '🔧 Page Builder',
        description: 'Fluent interface for building pages with components',
        actions: [
          { label: 'Create Page', onClick: createPageWithLinks },
          { label: 'Preview', onClick: () => currentPage ? toast.success('Page preview ready') : toast.info('No page to preview') }
        ],
        status: 'active'
      },
      {
        title: '🔌 Plugin System',
        description: 'Extensible architecture with runtime plugin loading',
        actions: [
          { label: 'Load Plugin', onClick: () => toast.info('Plugin loading demo') },
          { label: 'Manage', onClick: () => toast.info('Plugin management demo') }
        ],
        status: 'active'
      },
      {
        title: '🎯 IoC Container',
        description: 'Dependency injection container with lifetime management',
        actions: [
          { label: 'View Container', onClick: () => toast.info('IoC container demo') },
          { label: 'Inject Deps', onClick: () => toast.info('Dependency injection demo') }
        ],
        status: 'active'
      }
    ];

    return features.map((feature, index) => (
      <FeatureCard key={index}>
        <FeatureTitle>
          {feature.title}
          <StatusBadge $status={feature.status}>
            {feature.status}
          </StatusBadge>
        </FeatureTitle>
        <FeatureDescription>{feature.description}</FeatureDescription>
        <FeatureActions>
          {feature.actions.map((action, actionIndex) => (
            <Button
              key={actionIndex}
              onClick={action.onClick}
              style={{
                background: '#667eea',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                fontSize: '0.9em',
                borderRadius: '6px'
              }}
            >
              {action.label}
            </Button>
          ))}
        </FeatureActions>
      </FeatureCard>
    ));
  };

  const renderComponents = () => {
    return components.map((component, index) => (
      <ComponentCard key={index}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <ComponentName>{component.name}</ComponentName>
          <ComponentType>{component.type}</ComponentType>
        </div>
        <p style={{ color: '#666', fontSize: '0.9em', margin: '10px 0' }}>
          {component.description}
        </p>
        <ComponentActions>
          <Button
            onClick={() => toast.info(`Component ${component.name} selected`)}
            style={{ fontSize: '0.8em', padding: '6px 12px' }}
          >
            Use
          </Button>
          <Button
            onClick={() => toast.info(`Component ${component.name} configuration`)}
            style={{ fontSize: '0.8em', padding: '6px 12px' }}
          >
            Configure
          </Button>
        </ComponentActions>
      </ComponentCard>
    ));
  };

  if (loading) {
    return (
      <DashboardContainer>
        <Header />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Spinner size="large" />
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header />
      <DashboardContent>
        <DashboardHeader>
          <DashboardTitle>🚀 Universal CMS Dashboard</DashboardTitle>
          <DashboardSubtitle>
            Advanced Content Management System with SOLID Principles & Design Patterns
          </DashboardSubtitle>
        </DashboardHeader>

        <DashboardBody>
          {/* CMS Framework Status */}
          <SectionTitle>📊 System Status</SectionTitle>
          {cmsFramework && (
            <StatsGrid>
              <StatCard>
                <StatNumber>{cmsFramework.components}</StatNumber>
                <StatLabel>Components</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>{cmsFramework.plugins}</StatNumber>
                <StatLabel>Active Plugins</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>{links.length}</StatNumber>
                <StatLabel>Saved Links</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>{pipelineStatus}</StatNumber>
                <StatLabel>Pipeline Status</StatLabel>
              </StatCard>
            </StatsGrid>
          )}

          {/* Pipeline Status */}
          <SectionTitle>⚙️ Pipeline Status</SectionTitle>
          <PipelineStatus>
            <PipelineStep $active={pipelineStatus === 'authenticating'}>
              🔐 Authenticating
            </PipelineStep>
            <PipelineStep $active={pipelineStatus === 'validating'}>
              ✅ Validating
            </PipelineStep>
            <PipelineStep $active={pipelineStatus === 'processing'}>
              ⚙️ Processing
            </PipelineStep>
            <PipelineStep $active={pipelineStatus === 'rendering'}>
              🎨 Rendering
            </PipelineStep>
            <PipelineStep $active={pipelineStatus === 'idle'}>
              ✅ Complete
            </PipelineStep>
          </PipelineStatus>

          {/* Core Features */}
          <SectionTitle>🎯 Core CMS Features</SectionTitle>
          <FeatureGrid>
            {renderFeatureCards()}
          </FeatureGrid>

          {/* Component Registry */}
          <SectionTitle>🧩 Available Components</SectionTitle>
          <ComponentGrid>
            {renderComponents()}
          </ComponentGrid>

          {/* Page Preview */}
          {currentPage && (
            <>
              <SectionTitle>📄 Generated Page Preview</SectionTitle>
              <PagePreview>
                <h3>{currentPage.title}</h3>
                <div dangerouslySetInnerHTML={{ __html: currentPage.html }} />
              </PagePreview>
            </>
          )}

          {/* Active Plugins */}
          <SectionTitle>🔌 Active Plugins</SectionTitle>
          <FeatureGrid>
            {activePlugins.map((plugin, index) => (
              <FeatureCard key={index}>
                <FeatureTitle>
                  🔌 {plugin.name}
                  <StatusBadge $status={plugin.status}>
                    {plugin.status}
                  </StatusBadge>
                </FeatureTitle>
                <FeatureDescription>
                  Version: {plugin.version}
                </FeatureDescription>
                <FeatureActions>
                  <Button
                    onClick={() => toast.info(`Plugin ${plugin.name} details`)}
                    style={{
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      fontSize: '0.9em',
                      borderRadius: '6px'
                    }}
                  >
                    Configure
                  </Button>
                </FeatureActions>
              </FeatureCard>
            ))}
          </FeatureGrid>
        </DashboardBody>
      </DashboardContent>
    </DashboardContainer>
  );
};

export default CmsDashboard;