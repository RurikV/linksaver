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

import { IPipelineMiddleware, PipelineContext, getErrorMessage } from '../interfaces';

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
export class Pipeline {
  private middleware: Array<{
    handler: IPipelineMiddleware;
    condition?: (context: PipelineContext) => boolean | Promise<boolean>;
    async: boolean;
  }> = [];

  /**
   * Execute pipeline with context
   */
  async execute(context: PipelineContext): Promise<PipelineResult> {
    const metadata = new Map<string, any>();
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
    } catch (error) {
      metadata.set('endTime', Date.now());
      metadata.set('duration', metadata.get('endTime') - metadata.get('startTime'));
      metadata.set('error', error);

      return {
        success: false,
        context,
        error: error as Error,
        metadata
      };
    }
  }

  /**
   * Add middleware to pipeline
   */
  use(middleware: IPipelineMiddleware): Pipeline {
    this.middleware.push({
      handler: middleware,
      async: false
    });
    return this;
  }

  /**
   * Add conditional middleware
   */
  useConditional(
    middleware: IPipelineMiddleware,
    condition: (context: PipelineContext) => boolean
  ): Pipeline {
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
  useAsync(
    middleware: IPipelineMiddleware,
    condition?: (context: PipelineContext) => Promise<boolean>
  ): Pipeline {
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
  private async executeMiddleware(
    index: number,
    context: PipelineContext,
    metadata: Map<string, any>
  ): Promise<void> {
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

    } catch (error) {
      metadata.set('errorAt', index);
      metadata.set('errorMiddleware', handler.name);
      throw error;
    }
  }

  /**
   * Get middleware list
   */
  getMiddleware(): IPipelineMiddleware[] {
    return this.middleware.map(m => m.handler);
  }

  /**
   * Clear middleware
   */
  clear(): Pipeline {
    this.middleware = [];
    return this;
  }

  /**
   * Create pipeline builder
   */
  static builder(): PipelineBuilder {
    return new PipelineBuilderImpl();
  }
}

/**
 * Pipeline Builder Implementation
 * Builder Pattern for pipeline construction
 */
class PipelineBuilderImpl implements PipelineBuilder {
  private pipeline = new Pipeline();

  use(middleware: IPipelineMiddleware): PipelineBuilder {
    this.pipeline.use(middleware);
    return this;
  }

  useConditional(
    middleware: IPipelineMiddleware,
    condition: (context: PipelineContext) => boolean
  ): PipelineBuilder {
    this.pipeline.useConditional(middleware, condition);
    return this;
  }

  useAsync(
    middleware: IPipelineMiddleware,
    condition?: (context: PipelineContext) => Promise<boolean>
  ): PipelineBuilder {
    this.pipeline.useAsync(middleware, condition);
    return this;
  }

  build(): Pipeline {
    const result = this.pipeline;
    this.pipeline = new Pipeline();
    return result;
  }
}

/**
 * Built-in Middleware Implementations
 */

export class LoggingMiddleware implements IPipelineMiddleware {
  readonly name = 'logging';
  readonly priority = 0;

  async execute(context: PipelineContext, next: () => Promise<void>): Promise<void> {
    console.log(`[${Date.now()}] Pipeline started: ${context.request.url}`);
    const startTime = Date.now();

    try {
      await next();
      const duration = Date.now() - startTime;
      console.log(`[${Date.now()}] Pipeline completed in ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[${Date.now()}] Pipeline failed after ${duration}ms:`, error);
      throw error;
    }
  }
}

export class TimingMiddleware implements IPipelineMiddleware {
  readonly name = 'timing';
  readonly priority = 1;

  async execute(context: PipelineContext, next: () => Promise<void>): Promise<void> {
    context.metadata.set('pipelineStartTime', Date.now());

    try {
      await next();
    } finally {
      const duration = Date.now() - context.metadata.get('pipelineStartTime');
      context.metadata.set('pipelineDuration', duration);
    }
  }
}

export class ErrorHandlingMiddleware implements IPipelineMiddleware {
  readonly name = 'error-handling';
  readonly priority = 2;

  async execute(context: PipelineContext, next: () => Promise<void>): Promise<void> {
    try {
      await next();
    } catch (error) {
      context.metadata.set('error', error);
      context.response.status = 500;
      context.response.body = {
        error: 'Internal Server Error',
        message: getErrorMessage(error),
        timestamp: new Date().toISOString()
      };
      throw error;
    }
  }
}

export class CachingMiddleware implements IPipelineMiddleware {
  readonly name = 'caching';
  readonly priority = 3;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  constructor(private defaultTtl: number = 300000) { // 5 minutes default

  }

  async execute(context: PipelineContext, next: () => Promise<void>): Promise<void> {
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

  private generateCacheKey(context: PipelineContext): string {
    return `${context.request.method}:${context.request.url}:${JSON.stringify(context.request.params)}`;
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export class ValidationMiddleware implements IPipelineMiddleware {
  readonly name = 'validation';
  readonly priority = 4;

  constructor(
    private validators: Array<(context: PipelineContext) => Promise<void>> = []
  ) {}

  async execute(context: PipelineContext, next: () => Promise<void>): Promise<void> {
    // Run all validators
    for (const validator of this.validators) {
      await validator(context);
    }

    await next();
  }

  addValidator(validator: (context: PipelineContext) => Promise<void>): void {
    this.validators.push(validator);
  }
}

export class SecurityMiddleware implements IPipelineMiddleware {
  readonly name = 'security';
  readonly priority = 5;

  constructor(
    private options: {
      enableCors?: boolean;
      enableCsrf?: boolean;
      rateLimit?: number;
    } = {}
  ) {}

  async execute(context: PipelineContext, next: () => Promise<void>): Promise<void> {
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