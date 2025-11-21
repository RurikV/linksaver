/**
 * Page Builder - Builder Pattern Implementation
 *
 * Implements:
 * - Builder Pattern - Step-by-step page construction
 * - Director Pattern - Coordinates page building process
 * - Fluent Interface - Method chaining for readable code
 * - Validation Pipeline - Validates page structure
 *
 * SOLID Compliance:
 * S: Single Responsibility - Builder only handles page construction
 * O: Open/Closed - Can extend with new page types
 * D: Dependency Inversion - Depends on interfaces, not concretions
 */

import { IComponent, IPageBuilder, Page, PageMetadata, PageLayout, ThemeConfig, ComponentPosition, ValidationError, ValidationWarning, getErrorMessage } from '../interfaces';
import { CompositeComponent } from '../components/CompositeComponent';
import { ComponentRegistry } from '../plugins/ComponentRegistry';

export interface BuildConfiguration {
  validateStructure?: boolean;
  optimizePerformance?: boolean;
  generateMetadata?: boolean;
  applyTheme?: boolean;
  compressAssets?: boolean;
}

export interface BuildContext {
  configuration: BuildConfiguration;
  registry: ComponentRegistry;
  theme: ThemeConfig;
  cache: Map<string, any>;
}

export interface PageValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
}

// ValidationError and ValidationWarning are now imported from interfaces.ts

export interface ValidationSuggestion {
  code: string;
  message: string;
  improvement: string;
}

/**
 * Page Builder - Constructs pages using Builder Pattern
 * Provides fluent interface for step-by-step page construction
 */
export class PageBuilder implements IPageBuilder {
  private page: Partial<Page>;
  private buildContext: BuildContext;
  private currentZone: string = 'main';
  private tempComponents: Array<{
    component: IComponent;
    position: ComponentPosition;
  }> = [];

  constructor(
    private registry: ComponentRegistry,
    private defaultConfiguration: BuildConfiguration = {}
  ) {
    this.page = {};
    this.buildContext = {
      configuration: defaultConfiguration,
      registry,
      theme: this.createDefaultTheme(),
      cache: new Map()
    };
  }

  /**
   * Reset builder to initial state
   */
  reset(): IPageBuilder {
    this.page = {};
    this.currentZone = 'main';
    this.tempComponents = [];
    this.buildContext.cache.clear();
    return this;
  }

  /**
   * Set page metadata
   */
  setMetadata(metadata: Partial<PageMetadata>): IPageBuilder {
    this.page.metadata = {
      title: metadata.title || 'Untitled Page',
      description: metadata.description,
      keywords: metadata.keywords || [],
      author: metadata.author,
      locale: metadata.locale || 'en-US',
      seo: metadata.seo || this.getDefaultSEO(),
      ...metadata
    };
    return this;
  }

  /**
   * Add single component to page
   */
  addComponent(
    component: IComponent,
    position?: Partial<ComponentPosition>
  ): IPageBuilder {
    const componentPosition: ComponentPosition = {
      zone: position?.zone || this.currentZone,
      order: position?.order || this.getNextOrderForZone(position?.zone || this.currentZone),
      width: position?.width,
      height: position?.height,
      responsive: position?.responsive
    };

    this.tempComponents.push({ component, position: componentPosition });
    return this;
  }

  /**
   * Add multiple components
   */
  addComponents(components: Array<{
    component: IComponent;
    position?: Partial<ComponentPosition>;
  }>): IPageBuilder {
    for (const { component, position } of components) {
      this.addComponent(component, position);
    }
    return this;
  }

  /**
   * Set page layout
   */
  setLayout(layout: PageLayout): IPageBuilder {
    this.page.layout = layout;

    // Create zones from layout
    for (const zone of layout.zones) {
      if (!this.page.zoneComponents) {
        this.page.zoneComponents = new Map();
      }
      if (!this.page.zoneComponents.has(zone.id)) {
        this.page.zoneComponents.set(zone.id, []);
      }
    }

    return this;
  }

  /**
   * Set page theme
   */
  setTheme(theme: ThemeConfig): IPageBuilder {
    this.buildContext.theme = theme;
    this.page.theme = theme;
    return this;
  }

  /**
   * Add component to specific zone
   */
  addToZone(zone: string): IPageBuilder {
    this.currentZone = zone;
    return this;
  }

  /**
   * Add container component
   */
  addContainer(
    id: string,
    containerType: string = 'container',
    layout: string = 'vertical',
    position?: Partial<ComponentPosition>
  ): IPageBuilder {
    const metadata = {
      name: `${containerType}_${id}`,
      category: 'layout',
      tags: ['container', 'layout'],
      configuration: {
        layout,
        zones: ['main'],
        allowedChildTypes: []
      },
      dependencies: []
    };

    const container = new CompositeComponent(id, containerType, metadata, layout);
    return this.addComponent(container, position);
  }

  /**
   * Add component configuration
   */
  withConfiguration(configuration: BuildConfiguration): IPageBuilder {
    this.buildContext.configuration = { ...this.defaultConfiguration, ...configuration };
    return this;
  }

  /**
   * Build the page
   */
  async build(): Promise<Page> {
    try {
      // Validate page structure if enabled
      if (this.buildContext.configuration.validateStructure) {
        const validation = await this.validatePage();
        if (!validation.isValid) {
          throw new Error(`Page validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
        }
      }

      // Create root container if not exists
      if (!this.page.layout) {
        this.createDefaultLayout();
      }

      // Build component hierarchy
      await this.buildComponentHierarchy();

      // Generate metadata if enabled
      if (this.buildContext.configuration.generateMetadata) {
        await this.generatePageMetadata();
      }

      // Apply theme if enabled
      if (this.buildContext.configuration.applyTheme) {
        await this.applyThemeToComponents();
      }

      // Optimize performance if enabled
      if (this.buildContext.configuration.optimizePerformance) {
        await this.optimizePagePerformance();
      }

      // Convert temp components to Map structure
      const componentsMap = new Map<string, IComponent>();
      const zoneComponentsMap = new Map<string, IComponent[]>();

      for (const { component, position } of this.tempComponents) {
        componentsMap.set(component.id, component);

        // Add to zone components
        if (!zoneComponentsMap.has(position.zone)) {
          zoneComponentsMap.set(position.zone, []);
        }
        const zoneComps = zoneComponentsMap.get(position.zone)!;
        zoneComps[position.order] = component;
      }

      // Remove empty slots from zone arrays
      for (const [zone, components] of zoneComponentsMap) {
        zoneComponentsMap.set(zone, components.filter(Boolean));
      }

      const page: Page = {
        id: this.generatePageId(),
        metadata: this.page.metadata!,
        layout: this.page.layout!,
        components: componentsMap,
        theme: this.page.theme || this.buildContext.theme,
        zoneComponents: zoneComponentsMap,
        buildDate: new Date(),
        version: this.generateVersion(),
        status: 'active'
      };

      return page;
    } catch (error) {
      throw new Error(`Page build failed: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Validate page structure
   */
  async validatePage(): Promise<PageValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    // Validate metadata
    if (!this.page.metadata) {
      errors.push({
        code: 'MISSING_METADATA',
        message: 'Page metadata is required',
        severity: 'error'
      });
    } else {
      if (!this.page.metadata.title) {
        errors.push({
          code: 'MISSING_TITLE',
          message: 'Page title is required',
          severity: 'error'
        });
      }
    }

    // Validate layout
    if (!this.page.layout) {
      errors.push({
        code: 'MISSING_LAYOUT',
        message: 'Page layout is required',
        severity: 'error'
      });
    }

    // Validate components
    if (this.tempComponents.length === 0) {
      warnings.push({
        code: 'NO_COMPONENTS',
        message: 'Page has no components',
        severity: 'warning'
      });
    } else {
      // Check for duplicate IDs
      const componentIds = this.tempComponents.map(item => item.component.id);
      const duplicates = componentIds.filter((id, index) => componentIds.indexOf(id) !== index);
      if (duplicates.length > 0) {
        errors.push({
          code: 'DUPLICATE_COMPONENT_IDS',
          message: `Duplicate component IDs: ${duplicates.join(', ')}`,
          severity: 'error'
        });
      }

      // Validate each component
      for (const { component } of this.tempComponents) {
        const validation = component.validate();
        if (!validation.isValid) {
          errors.push(...validation.errors.map(error => ({
            ...error,
            component: component.id
          })));
        }
        warnings.push(...validation.warnings.map(warning => ({
          ...warning,
          component: component.id
        })));
      }
    }

    // Generate suggestions
    if (this.tempComponents.length > 10) {
      suggestions.push({
        code: 'OPTIMIZE_PERFORMANCE',
        message: 'Page has many components',
        improvement: 'Consider lazy loading or pagination for better performance'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  // ==================== Private Methods ====================

  private createDefaultTheme(): ThemeConfig {
    return {
      name: 'default',
      colors: {
        primary: '#007bff',
        secondary: '#6c757d',
        success: '#28a745',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8',
        light: '#f8f9fa',
        dark: '#343a40'
      },
      fonts: {
        primary: 'Arial, sans-serif',
        secondary: 'Georgia, serif',
        monospace: 'Courier New, monospace'
      },
      typography: {
        fontFamily: 'Arial, sans-serif',
        fontSize: {
          base: '16px',
          small: '14px',
          large: '18px',
          heading: '24px'
        }
      },
      spacing: {
        small: '8px',
        medium: '16px',
        large: '24px',
        xlarge: '48px'
      },
      breakpoints: {
        mobile: '768px',
        tablet: '1024px',
        desktop: '1200px'
      }
    };
  }

  private getDefaultSEO() {
    return {
      title: '',
      description: '',
      keywords: [],
      canonical: '',
      noindex: false,
      nofollow: false,
      openGraph: {
        title: '',
        description: '',
        image: '',
        type: 'website'
      }
    };
  }

  private getNextOrderForZone(zone: string): number {
    return this.tempComponents.filter(comp => comp.position.zone === zone).length;
  }

  private createDefaultLayout(): void {
    this.page.layout = {
      type: 'default',
      zones: [
        { id: 'header', type: 'container', components: [] },
        { id: 'main', type: 'slot', components: [] },
        { id: 'footer', type: 'container', components: [] }
      ],
      responsive: {
        mobile: { breakpoints: { max: '768px' } },
        tablet: { breakpoints: { min: '769px', max: '1024px' } },
        desktop: { breakpoints: { min: '1025px' } }
      }
    };
  }

  private async buildComponentHierarchy(): Promise<void> {
    // Component hierarchy is now built in the build method
    // This method is kept for compatibility but can be simplified
  }

  private async generatePageMetadata(): Promise<void> {
    if (!this.page.metadata) {
      return;
    }

    // Count components
    const componentCount = this.tempComponents.length;
    (this.page.metadata as any).componentCount = componentCount;

    // Generate description from components if not provided
    if (!this.page.metadata.description && componentCount > 0) {
      const firstComponent = this.tempComponents[0].component;
      this.page.metadata.description = `Page containing ${componentCount} components, starting with ${firstComponent.type}`;
    }
  }

  private async applyThemeToComponents(): Promise<void> {
    // Apply theme to components recursively
    for (const { component } of this.tempComponents) {
      if (component instanceof CompositeComponent) {
        await this.applyThemeToComposite(component);
      }
    }
  }

  private async applyThemeToComposite(composite: CompositeComponent): Promise<void> {
    // Apply theme to composite and its children
    for (const child of composite.getChildren()) {
      if (child instanceof CompositeComponent) {
        await this.applyThemeToComposite(child);
      }
    }
  }

  private async optimizePagePerformance(): Promise<void> {
    // Optimize component loading order
    this.tempComponents.sort((a, b) => {
      // Sort by priority: headers first, then main content, then footers
      const aPriority = this.getComponentPriority(a.component);
      const bPriority = this.getComponentPriority(b.component);
      return aPriority - bPriority;
    });
  }

  private getComponentPriority(component: IComponent): number {
    const priorityMap: Record<string, number> = {
      'header': 1,
      'navigation': 2,
      'hero': 3,
      'content': 4,
      'sidebar': 5,
      'footer': 6
    };

    return priorityMap[component.type] || 99;
  }

  private generatePageId(): string {
    return `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateVersion(): string {
    return `1.0.${Date.now()}`;
  }
}