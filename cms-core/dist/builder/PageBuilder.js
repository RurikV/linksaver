"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageBuilder = void 0;
const interfaces_1 = require("../interfaces");
const CompositeComponent_1 = require("../components/CompositeComponent");
/**
 * Page Builder - Constructs pages using Builder Pattern
 * Provides fluent interface for step-by-step page construction
 */
class PageBuilder {
    constructor(registry, defaultConfiguration = {}) {
        this.registry = registry;
        this.defaultConfiguration = defaultConfiguration;
        this.currentZone = 'main';
        this.tempComponents = [];
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
    reset() {
        this.page = {};
        this.currentZone = 'main';
        this.tempComponents = [];
        this.buildContext.cache.clear();
        return this;
    }
    /**
     * Set page metadata
     */
    setMetadata(metadata) {
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
    addComponent(component, position) {
        const componentPosition = {
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
    addComponents(components) {
        for (const { component, position } of components) {
            this.addComponent(component, position);
        }
        return this;
    }
    /**
     * Set page layout
     */
    setLayout(layout) {
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
    setTheme(theme) {
        this.buildContext.theme = theme;
        this.page.theme = theme;
        return this;
    }
    /**
     * Add component to specific zone
     */
    addToZone(zone) {
        this.currentZone = zone;
        return this;
    }
    /**
     * Add container component
     */
    addContainer(id, containerType = 'container', layout = 'vertical', position) {
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
        const container = new CompositeComponent_1.CompositeComponent(id, containerType, metadata, layout);
        return this.addComponent(container, position);
    }
    /**
     * Add component configuration
     */
    withConfiguration(configuration) {
        this.buildContext.configuration = { ...this.defaultConfiguration, ...configuration };
        return this;
    }
    /**
     * Build the page
     */
    async build() {
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
            const componentsMap = new Map();
            const zoneComponentsMap = new Map();
            for (const { component, position } of this.tempComponents) {
                componentsMap.set(component.id, component);
                // Add to zone components
                if (!zoneComponentsMap.has(position.zone)) {
                    zoneComponentsMap.set(position.zone, []);
                }
                const zoneComps = zoneComponentsMap.get(position.zone);
                zoneComps[position.order] = component;
            }
            // Remove empty slots from zone arrays
            for (const [zone, components] of zoneComponentsMap) {
                zoneComponentsMap.set(zone, components.filter(Boolean));
            }
            const page = {
                id: this.generatePageId(),
                metadata: this.page.metadata,
                layout: this.page.layout,
                components: componentsMap,
                theme: this.page.theme || this.buildContext.theme,
                zoneComponents: zoneComponentsMap,
                buildDate: new Date(),
                version: this.generateVersion(),
                status: 'active'
            };
            return page;
        }
        catch (error) {
            throw new Error(`Page build failed: ${(0, interfaces_1.getErrorMessage)(error)}`);
        }
    }
    /**
     * Validate page structure
     */
    async validatePage() {
        const errors = [];
        const warnings = [];
        const suggestions = [];
        // Validate metadata
        if (!this.page.metadata) {
            errors.push({
                code: 'MISSING_METADATA',
                message: 'Page metadata is required',
                severity: 'error'
            });
        }
        else {
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
        }
        else {
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
    createDefaultTheme() {
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
    getDefaultSEO() {
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
    getNextOrderForZone(zone) {
        return this.tempComponents.filter(comp => comp.position.zone === zone).length;
    }
    createDefaultLayout() {
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
    async buildComponentHierarchy() {
        // Component hierarchy is now built in the build method
        // This method is kept for compatibility but can be simplified
    }
    async generatePageMetadata() {
        if (!this.page.metadata) {
            return;
        }
        // Count components
        const componentCount = this.tempComponents.length;
        this.page.metadata.componentCount = componentCount;
        // Generate description from components if not provided
        if (!this.page.metadata.description && componentCount > 0) {
            const firstComponent = this.tempComponents[0].component;
            this.page.metadata.description = `Page containing ${componentCount} components, starting with ${firstComponent.type}`;
        }
    }
    async applyThemeToComponents() {
        // Apply theme to components recursively
        for (const { component } of this.tempComponents) {
            if (component instanceof CompositeComponent_1.CompositeComponent) {
                await this.applyThemeToComposite(component);
            }
        }
    }
    async applyThemeToComposite(composite) {
        // Apply theme to composite and its children
        for (const child of composite.getChildren()) {
            if (child instanceof CompositeComponent_1.CompositeComponent) {
                await this.applyThemeToComposite(child);
            }
        }
    }
    async optimizePagePerformance() {
        // Optimize component loading order
        this.tempComponents.sort((a, b) => {
            // Sort by priority: headers first, then main content, then footers
            const aPriority = this.getComponentPriority(a.component);
            const bPriority = this.getComponentPriority(b.component);
            return aPriority - bPriority;
        });
    }
    getComponentPriority(component) {
        const priorityMap = {
            'header': 1,
            'navigation': 2,
            'hero': 3,
            'content': 4,
            'sidebar': 5,
            'footer': 6
        };
        return priorityMap[component.type] || 99;
    }
    generatePageId() {
        return `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateVersion() {
        return `1.0.${Date.now()}`;
    }
}
exports.PageBuilder = PageBuilder;
