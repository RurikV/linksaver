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

import { IComponent, IComponentLifecycle, ComponentMetadata, ComponentContext, RenderContext, RenderResult, ValidationResult, ValidationError, ValidationWarning, RenderError, RenderMetadata, getErrorMessage } from '../interfaces';

export abstract class BaseComponent implements IComponent {
  public readonly id: string;
  public readonly type: string;
  public readonly metadata: ComponentMetadata;

  protected isInitialized: boolean = false;
  protected isDisposed: boolean = false;
  protected lifecycleHandlers: IComponentLifecycle[] = [];
  protected eventListeners: Map<string, Function[]> = new Map();

  constructor(
    id: string,
    type: string,
    metadata: ComponentMetadata
  ) {
    this.id = id;
    this.type = type;
    this.metadata = { ...metadata };
  }

  // ==================== IComponent Implementation ====================

  /**
   * Initialize component with context
   * Template Method Pattern - defines the initialization algorithm
   */
  async initialize(context: ComponentContext): Promise<void> {
    if (this.isInitialized) {
      throw new Error(`Component ${this.id} is already initialized`);
    }

    try {
      await this.onBeforeInit(context);

      // Execute lifecycle handlers
      for (const handler of this.lifecycleHandlers) {
        if (handler.onBeforeInit) {
          await handler.onBeforeInit(this);
        }
      }

      await this.doInitialize(context);
      this.isInitialized = true;

      await this.onAfterInit(context);

      // Execute lifecycle handlers
      for (const handler of this.lifecycleHandlers) {
        if (handler.onAfterInit) {
          await handler.onAfterInit(this);
        }
      }

      this.emit('initialized', { component: this, context });
    } catch (error) {
      this.emit('error', { component: this, error, phase: 'initialize' });
      throw error;
    }
  }

  /**
   * Render component
   * Template Method Pattern - defines the rendering algorithm
   */
  async render(context: RenderContext): Promise<RenderResult> {
    if (!this.isInitialized) {
      throw new Error(`Component ${this.id} is not initialized`);
    }

    if (this.isDisposed) {
      throw new Error(`Component ${this.id} is disposed`);
    }

    try {
      await this.onBeforeRender(context);

      // Execute lifecycle handlers
      for (const handler of this.lifecycleHandlers) {
        if (handler.onBeforeRender) {
          await handler.onBeforeRender(this);
        }
      }

      const result = await this.doRender(context);

      await this.onAfterRender(result);

      // Execute lifecycle handlers
      for (const handler of this.lifecycleHandlers) {
        if (handler.onAfterRender) {
          await handler.onAfterRender(this, result);
        }
      }

      this.emit('rendered', { component: this, result, context });
      return result;
    } catch (error) {
      this.emit('error', { component: this, error, phase: 'render' });
      return this.createErrorResult(error, context);
    }
  }

  /**
   * Validate component configuration
   */
  validate(): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate required metadata
    if (!this.metadata.name) {
      errors.push({
        code: 'MISSING_NAME',
        message: 'Component metadata must have a name',
        severity: 'error'
      });
    }

    if (!this.metadata.category) {
      errors.push({
        code: 'MISSING_CATEGORY',
        message: 'Component metadata must have a category',
        severity: 'error'
      });
    }

    // Custom validation
    try {
      const customValidation = this.doValidate();
      errors.push(...customValidation.errors);
      warnings.push(...customValidation.warnings);
    } catch (error) {
      errors.push({
        code: 'VALIDATION_ERROR',
        message: `Validation failed: ${getErrorMessage(error)}`,
        severity: 'error'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Dispose component
   */
  async dispose(): Promise<void> {
    if (this.isDisposed) {
      return;
    }

    try {
      await this.onBeforeDispose();

      // Execute lifecycle handlers
      for (const handler of this.lifecycleHandlers) {
        if (handler.onBeforeDestroy) {
          await handler.onBeforeDestroy(this);
        }
      }

      await this.doDispose();

      this.lifecycleHandlers = [];
      this.eventListeners.clear();
      this.isDisposed = true;

      // Execute lifecycle handlers
      for (const handler of this.lifecycleHandlers) {
        if (handler.onAfterDestroy) {
          await handler.onAfterDestroy(this);
        }
      }

      await this.onAfterDispose();

      this.emit('disposed', { component: this });
    } catch (error) {
      this.emit('error', { component: this, error, phase: 'dispose' });
      throw error;
    }
  }

  // ==================== Lifecycle Management ====================

  /**
   * Add lifecycle handler
   */
  addLifecycleHandler(handler: IComponentLifecycle): void {
    this.lifecycleHandlers.push(handler);
  }

  /**
   * Remove lifecycle handler
   */
  removeLifecycleHandler(handler: IComponentLifecycle): void {
    const index = this.lifecycleHandlers.indexOf(handler);
    if (index > -1) {
      this.lifecycleHandlers.splice(index, 1);
    }
  }

  // ==================== Event Management ====================

  /**
   * Add event listener
   */
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * Remove event listener
   */
  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event
   */
  protected emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // ==================== Protected Template Methods ====================

  /**
   * Template method - Override in subclasses
   */
  protected async doInitialize(context: ComponentContext): Promise<void> {
    // Default implementation - can be overridden
  }

  /**
   * Template method - Override in subclasses
   */
  protected abstract doRender(context: RenderContext): Promise<RenderResult>;

  /**
   * Template method - Override in subclasses
   */
  protected doValidate(): ValidationResult {
    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }

  /**
   * Template method - Override in subclasses
   */
  protected async doDispose(): Promise<void> {
    // Default implementation - can be overridden
  }

  /**
   * Template method - Override in subclasses
   */
  protected async onBeforeInit(context: ComponentContext): Promise<void> {
    // Default implementation - can be overridden
  }

  /**
   * Template method - Override in subclasses
   */
  protected async onAfterInit(context: ComponentContext): Promise<void> {
    // Default implementation - can be overridden
  }

  /**
   * Template method - Override in subclasses
   */
  protected async onBeforeRender(context: RenderContext): Promise<void> {
    // Default implementation - can be overridden
  }

  /**
   * Template method - Override in subclasses
   */
  protected async onAfterRender(result: RenderResult): Promise<void> {
    // Default implementation - can be overridden
  }

  /**
   * Template method - Override in subclasses
   */
  protected async onBeforeDispose(): Promise<void> {
    // Default implementation - can be overridden
  }

  /**
   * Template method - Override in subclasses
   */
  protected async onAfterDispose(): Promise<void> {
    // Default implementation - can be overridden
  }

  // ==================== Utility Methods ====================

  /**
   * Create error render result
   */
  protected createErrorResult(error: any, context: RenderContext): RenderResult {
    return {
      content: `<div class="component-error">
        <h4>Component Error: ${this.type}</h4>
        <p>${getErrorMessage(error)}</p>
      </div>`,
      assets: [],
      metadata: {
        component: this.type,
        error: getErrorMessage(error),
        timestamp: new Date().toISOString()
      },
      status: 'error',
      errors: [{
        code: 'RENDER_ERROR',
        message: getErrorMessage(error),
        severity: 'error'
      }]
    };
  }

  /**
   * Get configuration value with default
   */
  protected getConfig<T>(key: string, defaultValue: T): T {
    return this.metadata.configuration?.[key] ?? defaultValue;
  }

  /**
   * Check if component is in a specific state
   */
  public get isReady(): boolean {
    return this.isInitialized && !this.isDisposed;
  }
}

// ==================== Type Definitions ====================
// ValidationError, ValidationWarning, RenderError, and RenderMetadata are now imported from interfaces.ts