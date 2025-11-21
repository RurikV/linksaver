/**
 * Base Component Implementation
 *
 * Implements:
 * - Template Method Pattern for lifecycle
 * - Observer Pattern for event handling
 * - Proxy Pattern for access control
 * - Component validation and configuration
 *
 * SOLID Compliance:
 * S: Single responsibility - each component handles one concern
 * O: Open/Closed - can be extended via inheritance
 * L: Liskov Substitution - components can be substituted
 * I: Interface Segregation - focused interfaces
 */
import { IComponent, IComponentLifecycle, ComponentMetadata, ComponentContext, RenderContext, RenderResult, ValidationResult } from '../interfaces';
export declare abstract class BaseComponent implements IComponent {
    readonly id: string;
    readonly type: string;
    readonly metadata: ComponentMetadata;
    protected isInitialized: boolean;
    protected isDisposed: boolean;
    protected lifecycleHandlers: IComponentLifecycle[];
    protected eventListeners: Map<string, Function[]>;
    constructor(id: string, type: string, metadata: ComponentMetadata);
    /**
     * Initialize component with context
     * Template Method Pattern - defines the initialization algorithm
     */
    initialize(context: ComponentContext): Promise<void>;
    /**
     * Render component
     * Template Method Pattern - defines the rendering algorithm
     */
    render(context: RenderContext): Promise<RenderResult>;
    /**
     * Validate component configuration
     */
    validate(): ValidationResult;
    /**
     * Dispose component
     */
    dispose(): Promise<void>;
    /**
     * Add lifecycle handler
     */
    addLifecycleHandler(handler: IComponentLifecycle): void;
    /**
     * Remove lifecycle handler
     */
    removeLifecycleHandler(handler: IComponentLifecycle): void;
    /**
     * Add event listener
     */
    on(event: string, listener: Function): void;
    /**
     * Remove event listener
     */
    off(event: string, listener: Function): void;
    /**
     * Emit event
     */
    protected emit(event: string, data?: any): void;
    /**
     * Template method - Override in subclasses
     */
    protected doInitialize(context: ComponentContext): Promise<void>;
    /**
     * Template method - Override in subclasses
     */
    protected abstract doRender(context: RenderContext): Promise<RenderResult>;
    /**
     * Template method - Override in subclasses
     */
    protected doValidate(): ValidationResult;
    /**
     * Template method - Override in subclasses
     */
    protected doDispose(): Promise<void>;
    /**
     * Template method - Override in subclasses
     */
    protected onBeforeInit(context: ComponentContext): Promise<void>;
    /**
     * Template method - Override in subclasses
     */
    protected onAfterInit(context: ComponentContext): Promise<void>;
    /**
     * Template method - Override in subclasses
     */
    protected onBeforeRender(context: RenderContext): Promise<void>;
    /**
     * Template method - Override in subclasses
     */
    protected onAfterRender(result: RenderResult): Promise<void>;
    /**
     * Template method - Override in subclasses
     */
    protected onBeforeDispose(): Promise<void>;
    /**
     * Template method - Override in subclasses
     */
    protected onAfterDispose(): Promise<void>;
    /**
     * Create error render result
     */
    protected createErrorResult(error: any, context: RenderContext): RenderResult;
    /**
     * Get configuration value with default
     */
    protected getConfig<T>(key: string, defaultValue: T): T;
    /**
     * Check if component is in a specific state
     */
    get isReady(): boolean;
}
