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
import { IComponent, IPageBuilder, Page, PageMetadata, PageLayout, ThemeConfig, ComponentPosition, ValidationError, ValidationWarning } from '../interfaces';
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
export interface ValidationSuggestion {
    code: string;
    message: string;
    improvement: string;
}
/**
 * Page Builder - Constructs pages using Builder Pattern
 * Provides fluent interface for step-by-step page construction
 */
export declare class PageBuilder implements IPageBuilder {
    private registry;
    private defaultConfiguration;
    private page;
    private buildContext;
    private currentZone;
    private tempComponents;
    constructor(registry: ComponentRegistry, defaultConfiguration?: BuildConfiguration);
    /**
     * Reset builder to initial state
     */
    reset(): IPageBuilder;
    /**
     * Set page metadata
     */
    setMetadata(metadata: Partial<PageMetadata>): IPageBuilder;
    /**
     * Add single component to page
     */
    addComponent(component: IComponent, position?: Partial<ComponentPosition>): IPageBuilder;
    /**
     * Add multiple components
     */
    addComponents(components: Array<{
        component: IComponent;
        position?: Partial<ComponentPosition>;
    }>): IPageBuilder;
    /**
     * Set page layout
     */
    setLayout(layout: PageLayout): IPageBuilder;
    /**
     * Set page theme
     */
    setTheme(theme: ThemeConfig): IPageBuilder;
    /**
     * Add component to specific zone
     */
    addToZone(zone: string): IPageBuilder;
    /**
     * Add container component
     */
    addContainer(id: string, containerType?: string, layout?: string, position?: Partial<ComponentPosition>): IPageBuilder;
    /**
     * Add component configuration
     */
    withConfiguration(configuration: BuildConfiguration): IPageBuilder;
    /**
     * Build the page
     */
    build(): Promise<Page>;
    /**
     * Validate page structure
     */
    validatePage(): Promise<PageValidationResult>;
    private createDefaultTheme;
    private getDefaultSEO;
    private getNextOrderForZone;
    private createDefaultLayout;
    private buildComponentHierarchy;
    private generatePageMetadata;
    private applyThemeToComponents;
    private applyThemeToComposite;
    private optimizePagePerformance;
    private getComponentPriority;
    private generatePageId;
    private generateVersion;
}
