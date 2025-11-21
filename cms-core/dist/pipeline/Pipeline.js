"use strict";
/**
 * Pipeline System - Middleware Chain
 *
 * Implements:
 * - Chain of Responsibility Pattern
 * - Pipeline Pattern for request processing
 * - Decorator Pattern for middleware enhancement
 * - Strategy Pattern for pipeline configuration
 *
 * SOLID Compliance:
 * O: Open/Closed - can add new middleware without changes
 * D: Dependency Inversion - depends on middleware interface
 * S: Single Responsibility - each middleware handles one concern
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityMiddleware = exports.ValidationMiddleware = exports.CachingMiddleware = exports.ErrorHandlingMiddleware = exports.TimingMiddleware = exports.LoggingMiddleware = exports.Pipeline = void 0;
const interfaces_1 = require("../interfaces");
/**
 * Pipeline for processing requests through middleware chain
 * Provides flexible and extensible request processing
 */
class Pipeline {
    constructor() {
        this.middleware = [];
    }
    /**
     * Execute pipeline with context
     */
    async execute(context) {
        const metadata = new Map();
        metadata.set('startTime', Date.now());
        metadata.set('middlewareExecuted', []);
        try {
            await this.executeMiddleware(0, context, metadata);
            metadata.set('endTime', Date.now());
            metadata.set('duration', metadata.get('endTime') - metadata.get('startTime'));
            return {
                success: true,
                context,
                metadata
            };
        }
        catch (error) {
            metadata.set('endTime', Date.now());
            metadata.set('duration', metadata.get('endTime') - metadata.get('startTime'));
            metadata.set('error', error);
            return {
                success: false,
                context,
                error: error,
                metadata
            };
        }
    }
    /**
     * Add middleware to pipeline
     */
    use(middleware) {
        this.middleware.push({
            handler: middleware,
            async: false
        });
        return this;
    }
    /**
     * Add conditional middleware
     */
    useConditional(middleware, condition) {
        this.middleware.push({
            handler: middleware,
            condition,
            async: false
        });
        return this;
    }
    /**
     * Add async conditional middleware
     */
    useAsync(middleware, condition) {
        this.middleware.push({
            handler: middleware,
            condition,
            async: true
        });
        return this;
    }
    /**
     * Execute middleware chain
     */
    async executeMiddleware(index, context, metadata) {
        if (index >= this.middleware.length) {
            return;
        }
        const { handler, condition, async } = this.middleware[index];
        try {
            // Check condition
            if (condition) {
                const shouldExecute = async ? await condition(context) : condition(context);
                if (!shouldExecute) {
                    return this.executeMiddleware(index + 1, context, metadata);
                }
            }
            // Execute middleware
            const startTime = Date.now();
            metadata.set('middlewareExecuted', [
                ...(metadata.get('middlewareExecuted') || []),
                handler.name
            ]);
            await handler.execute(context, () => this.executeMiddleware(index + 1, context, metadata));
            const duration = Date.now() - startTime;
            metadata.set(`${handler.name}_duration`, duration);
        }
        catch (error) {
            metadata.set('errorAt', index);
            metadata.set('errorMiddleware', handler.name);
            throw error;
        }
    }
    /**
     * Get middleware list
     */
    getMiddleware() {
        return this.middleware.map(m => m.handler);
    }
    /**
     * Clear middleware
     */
    clear() {
        this.middleware = [];
        return this;
    }
    /**
     * Create pipeline builder
     */
    static builder() {
        return new PipelineBuilderImpl();
    }
}
exports.Pipeline = Pipeline;
/**
 * Pipeline Builder Implementation
 * Builder Pattern for pipeline construction
 */
class PipelineBuilderImpl {
    constructor() {
        this.pipeline = new Pipeline();
    }
    use(middleware) {
        this.pipeline.use(middleware);
        return this;
    }
    useConditional(middleware, condition) {
        this.pipeline.useConditional(middleware, condition);
        return this;
    }
    useAsync(middleware, condition) {
        this.pipeline.useAsync(middleware, condition);
        return this;
    }
    build() {
        const result = this.pipeline;
        this.pipeline = new Pipeline();
        return result;
    }
}
/**
 * Built-in Middleware Implementations
 */
class LoggingMiddleware {
    constructor() {
        this.name = 'logging';
        this.priority = 0;
    }
    async execute(context, next) {
        console.log(`[${Date.now()}] Pipeline started: ${context.request.url}`);
        const startTime = Date.now();
        try {
            await next();
            const duration = Date.now() - startTime;
            console.log(`[${Date.now()}] Pipeline completed in ${duration}ms`);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            console.error(`[${Date.now()}] Pipeline failed after ${duration}ms:`, error);
            throw error;
        }
    }
}
exports.LoggingMiddleware = LoggingMiddleware;
class TimingMiddleware {
    constructor() {
        this.name = 'timing';
        this.priority = 1;
    }
    async execute(context, next) {
        context.metadata.set('pipelineStartTime', Date.now());
        try {
            await next();
        }
        finally {
            const duration = Date.now() - context.metadata.get('pipelineStartTime');
            context.metadata.set('pipelineDuration', duration);
        }
    }
}
exports.TimingMiddleware = TimingMiddleware;
class ErrorHandlingMiddleware {
    constructor() {
        this.name = 'error-handling';
        this.priority = 2;
    }
    async execute(context, next) {
        try {
            await next();
        }
        catch (error) {
            context.metadata.set('error', error);
            context.response.status = 500;
            context.response.body = {
                error: 'Internal Server Error',
                message: (0, interfaces_1.getErrorMessage)(error),
                timestamp: new Date().toISOString()
            };
            throw error;
        }
    }
}
exports.ErrorHandlingMiddleware = ErrorHandlingMiddleware;
class CachingMiddleware {
    constructor(defaultTtl = 300000) {
        this.defaultTtl = defaultTtl;
        this.name = 'caching';
        this.priority = 3;
        this.cache = new Map();
    }
    async execute(context, next) {
        const cacheKey = this.generateCacheKey(context);
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < cached.ttl) {
            context.response.body = cached.data;
            context.response.headers['X-Cache'] = 'HIT';
            return;
        }
        await next();
        // Cache successful responses
        if (context.response.status === 200 && context.response.body) {
            this.cache.set(cacheKey, {
                data: context.response.body,
                timestamp: Date.now(),
                ttl: this.defaultTtl
            });
            context.response.headers['X-Cache'] = 'MISS';
        }
    }
    generateCacheKey(context) {
        return `${context.request.method}:${context.request.url}:${JSON.stringify(context.request.params)}`;
    }
    clearCache() {
        this.cache.clear();
    }
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}
exports.CachingMiddleware = CachingMiddleware;
class ValidationMiddleware {
    constructor(validators = []) {
        this.validators = validators;
        this.name = 'validation';
        this.priority = 4;
    }
    async execute(context, next) {
        // Run all validators
        for (const validator of this.validators) {
            await validator(context);
        }
        await next();
    }
    addValidator(validator) {
        this.validators.push(validator);
    }
}
exports.ValidationMiddleware = ValidationMiddleware;
class SecurityMiddleware {
    constructor(options = {}) {
        this.options = options;
        this.name = 'security';
        this.priority = 5;
    }
    async execute(context, next) {
        // Add security headers
        context.response.headers['X-Content-Type-Options'] = 'nosniff';
        context.response.headers['X-Frame-Options'] = 'DENY';
        context.response.headers['X-XSS-Protection'] = '1; mode=block';
        if (this.options.enableCors) {
            context.response.headers['Access-Control-Allow-Origin'] = '*';
            context.response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
            context.response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
        }
        await next();
    }
}
exports.SecurityMiddleware = SecurityMiddleware;
