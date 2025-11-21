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
import { IPipelineMiddleware, PipelineContext } from '../interfaces';
export interface PipelineResult {
    success: boolean;
    context: PipelineContext;
    error?: Error;
    metadata: Map<string, any>;
}
export interface PipelineBuilder {
    use(middleware: IPipelineMiddleware): PipelineBuilder;
    useConditional(middleware: IPipelineMiddleware, condition: (context: PipelineContext) => boolean): PipelineBuilder;
    useAsync(middleware: IPipelineMiddleware, condition?: (context: PipelineContext) => Promise<boolean>): PipelineBuilder;
    build(): Pipeline;
}
/**
 * Pipeline for processing requests through middleware chain
 * Provides flexible and extensible request processing
 */
export declare class Pipeline {
    private middleware;
    /**
     * Execute pipeline with context
     */
    execute(context: PipelineContext): Promise<PipelineResult>;
    /**
     * Add middleware to pipeline
     */
    use(middleware: IPipelineMiddleware): Pipeline;
    /**
     * Add conditional middleware
     */
    useConditional(middleware: IPipelineMiddleware, condition: (context: PipelineContext) => boolean): Pipeline;
    /**
     * Add async conditional middleware
     */
    useAsync(middleware: IPipelineMiddleware, condition?: (context: PipelineContext) => Promise<boolean>): Pipeline;
    /**
     * Execute middleware chain
     */
    private executeMiddleware;
    /**
     * Get middleware list
     */
    getMiddleware(): IPipelineMiddleware[];
    /**
     * Clear middleware
     */
    clear(): Pipeline;
    /**
     * Create pipeline builder
     */
    static builder(): PipelineBuilder;
}
/**
 * Built-in Middleware Implementations
 */
export declare class LoggingMiddleware implements IPipelineMiddleware {
    readonly name = "logging";
    readonly priority = 0;
    execute(context: PipelineContext, next: () => Promise<void>): Promise<void>;
}
export declare class TimingMiddleware implements IPipelineMiddleware {
    readonly name = "timing";
    readonly priority = 1;
    execute(context: PipelineContext, next: () => Promise<void>): Promise<void>;
}
export declare class ErrorHandlingMiddleware implements IPipelineMiddleware {
    readonly name = "error-handling";
    readonly priority = 2;
    execute(context: PipelineContext, next: () => Promise<void>): Promise<void>;
}
export declare class CachingMiddleware implements IPipelineMiddleware {
    private defaultTtl;
    readonly name = "caching";
    readonly priority = 3;
    private cache;
    constructor(defaultTtl?: number);
    execute(context: PipelineContext, next: () => Promise<void>): Promise<void>;
    private generateCacheKey;
    clearCache(): void;
    getCacheStats(): {
        size: number;
        keys: string[];
    };
}
export declare class ValidationMiddleware implements IPipelineMiddleware {
    private validators;
    readonly name = "validation";
    readonly priority = 4;
    constructor(validators?: Array<(context: PipelineContext) => Promise<void>>);
    execute(context: PipelineContext, next: () => Promise<void>): Promise<void>;
    addValidator(validator: (context: PipelineContext) => Promise<void>): void;
}
export declare class SecurityMiddleware implements IPipelineMiddleware {
    private options;
    readonly name = "security";
    readonly priority = 5;
    constructor(options?: {
        enableCors?: boolean;
        enableCsrf?: boolean;
        rateLimit?: number;
    });
    execute(context: PipelineContext, next: () => Promise<void>): Promise<void>;
}
