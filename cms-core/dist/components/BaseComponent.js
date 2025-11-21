"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseComponent = void 0;
const interfaces_1 = require("../interfaces");
class BaseComponent {
    constructor(id, type, metadata) {
        this.isInitialized = false;
        this.isDisposed = false;
        this.lifecycleHandlers = [];
        this.eventListeners = new Map();
        this.id = id;
        this.type = type;
        this.metadata = { ...metadata };
    }
    // ==================== IComponent Implementation ====================
    /**
     * Initialize component with context
     * Template Method Pattern - defines the initialization algorithm
     */
    async initialize(context) {
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
        }
        catch (error) {
            this.emit('error', { component: this, error, phase: 'initialize' });
            throw error;
        }
    }
    /**
     * Render component
     * Template Method Pattern - defines the rendering algorithm
     */
    async render(context) {
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
        }
        catch (error) {
            this.emit('error', { component: this, error, phase: 'render' });
            return this.createErrorResult(error, context);
        }
    }
    /**
     * Validate component configuration
     */
    validate() {
        const errors = [];
        const warnings = [];
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
        }
        catch (error) {
            errors.push({
                code: 'VALIDATION_ERROR',
                message: `Validation failed: ${(0, interfaces_1.getErrorMessage)(error)}`,
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
    async dispose() {
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
        }
        catch (error) {
            this.emit('error', { component: this, error, phase: 'dispose' });
            throw error;
        }
    }
    // ==================== Lifecycle Management ====================
    /**
     * Add lifecycle handler
     */
    addLifecycleHandler(handler) {
        this.lifecycleHandlers.push(handler);
    }
    /**
     * Remove lifecycle handler
     */
    removeLifecycleHandler(handler) {
        const index = this.lifecycleHandlers.indexOf(handler);
        if (index > -1) {
            this.lifecycleHandlers.splice(index, 1);
        }
    }
    // ==================== Event Management ====================
    /**
     * Add event listener
     */
    on(event, listener) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(listener);
    }
    /**
     * Remove event listener
     */
    off(event, listener) {
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
    emit(event, data) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(listener => {
                try {
                    listener(data);
                }
                catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }
    // ==================== Protected Template Methods ====================
    /**
     * Template method - Override in subclasses
     */
    async doInitialize(context) {
        // Default implementation - can be overridden
    }
    /**
     * Template method - Override in subclasses
     */
    doValidate() {
        return {
            isValid: true,
            errors: [],
            warnings: []
        };
    }
    /**
     * Template method - Override in subclasses
     */
    async doDispose() {
        // Default implementation - can be overridden
    }
    /**
     * Template method - Override in subclasses
     */
    async onBeforeInit(context) {
        // Default implementation - can be overridden
    }
    /**
     * Template method - Override in subclasses
     */
    async onAfterInit(context) {
        // Default implementation - can be overridden
    }
    /**
     * Template method - Override in subclasses
     */
    async onBeforeRender(context) {
        // Default implementation - can be overridden
    }
    /**
     * Template method - Override in subclasses
     */
    async onAfterRender(result) {
        // Default implementation - can be overridden
    }
    /**
     * Template method - Override in subclasses
     */
    async onBeforeDispose() {
        // Default implementation - can be overridden
    }
    /**
     * Template method - Override in subclasses
     */
    async onAfterDispose() {
        // Default implementation - can be overridden
    }
    // ==================== Utility Methods ====================
    /**
     * Create error render result
     */
    createErrorResult(error, context) {
        return {
            content: `<div class="component-error">
        <h4>Component Error: ${this.type}</h4>
        <p>${(0, interfaces_1.getErrorMessage)(error)}</p>
      </div>`,
            assets: [],
            metadata: {
                component: this.type,
                error: (0, interfaces_1.getErrorMessage)(error),
                timestamp: new Date().toISOString()
            },
            status: 'error',
            errors: [{
                    code: 'RENDER_ERROR',
                    message: (0, interfaces_1.getErrorMessage)(error),
                    severity: 'error'
                }]
        };
    }
    /**
     * Get configuration value with default
     */
    getConfig(key, defaultValue) {
        return this.metadata.configuration?.[key] ?? defaultValue;
    }
    /**
     * Check if component is in a specific state
     */
    get isReady() {
        return this.isInitialized && !this.isDisposed;
    }
}
exports.BaseComponent = BaseComponent;
// ==================== Type Definitions ====================
// ValidationError, ValidationWarning, RenderError, and RenderMetadata are now imported from interfaces.ts
