/**
 * Component Registry Service
 *
 * Microservice for managing component plugins and registration
 *
 * Features:
 * - Dynamic component plugin loading
 * - Component metadata management
 * - Plugin lifecycle management
 * - Health monitoring
 * - Metrics and tracing
 * - Circuit breaker pattern
 *
 * SOLID Compliance:
 * S: Handles only component registration
 * O: Open for extension with new plugin types
 * L: Compatible with component interface
 * I: Focused registration interfaces
 * D: Depends on abstractions
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { IoCContainer } from '@cms/core/container';
import { ComponentRegistry } from '@cms/core/plugins';
import { Pipeline } from '@cms/core/pipeline';
import { Logger, Metrics, Tracing } from '@cms/core/observability';

// Service modules
import { ComponentController } from './controllers/ComponentController';
import { PluginController } from './controllers/PluginController';
import { HealthController } from './controllers/HealthController';
import { MiddlewareController } from './controllers/MiddlewareController';

// Configuration
import { loadConfiguration } from './config';
import { connectDatabase } from './database';
import { errorHandler, requestLogger } from './middleware';

interface ServiceConfiguration {
  port: number;
  database: {
    url: string;
    options: any;
  };
  redis: {
    url: string;
    options: any;
  };
  consul: {
    url: string;
    service: {
      name: string;
      id: string;
      tags: string[];
    };
  };
  tracing: {
    enabled: boolean;
    endpoint: string;
  };
  metrics: {
    enabled: boolean;
    endpoint: string;
  };
  logging: {
    level: string;
    format: string;
  };
}

class ComponentRegistryService {
  private app: express.Application;
  private server: any;
  private container: IoCContainer;
  private registry: ComponentRegistry;
  private logger: Logger;
  private metrics: Metrics;
  private tracing: Tracing;
  private config: ServiceConfiguration;

  constructor() {
    this.app = express();
    this.container = new IoCContainer();
    this.config = loadConfiguration();
  }

  async start(): Promise<void> {
    try {
      // Initialize observability
      await this.initializeObservability();

      // Initialize database
      await this.initializeDatabase();

      // Initialize container
      await this.initializeContainer();

      // Initialize middleware
      await this.initializeMiddleware();

      // Initialize routes
      await this.initializeRoutes();

      // Register with Consul
      await this.registerWithConsul();

      // Start server
      await this.startServer();

      this.logger.info('Component Registry Service started successfully', {
        port: this.config.port,
        serviceId: this.config.consul.service.id
      });
    } catch (error) {
      this.logger.error('Failed to start Component Registry Service', { error });
      process.exit(1);
    }
  }

  async stop(): Promise<void> {
    try {
      if (this.server) {
        await this.shutdownServer();
      }

      await this.deregisterFromConsul();
      await this.container.dispose();
      await this.disconnectDatabase();

      this.logger.info('Component Registry Service stopped gracefully');
    } catch (error) {
      this.logger.error('Error during shutdown', { error });
      process.exit(1);
    }
  }

  private async initializeObservability(): Promise<void> {
    this.logger = new Logger(this.config.logging);
    this.metrics = new Metrics(this.config.metrics);
    this.tracing = new Tracing(this.config.tracing);

    await Promise.all([
      this.logger.initialize(),
      this.metrics.initialize(),
      this.tracing.initialize()
    ]);

    // Register with container
    this.container.registerSingleton('logger', this.logger);
    this.container.registerSingleton('metrics', this.metrics);
    this.container.registerSingleton('tracing', this.tracing);
  }

  private async initializeDatabase(): Promise<void> {
    await connectDatabase(this.config.database.url, this.config.database.options);
    this.logger.info('Database connected successfully');
  }

  private async disconnectDatabase(): Promise<void> {
    // Implementation depends on database library used
    this.logger.info('Database disconnected');
  }

  private async initializeContainer(): Promise<void> {
    // Register core services
    this.registry = new ComponentRegistry(this.container);
    this.container.registerSingleton('componentRegistry', this.registry);

    // Register pipeline
    const pipeline = Pipeline.builder()
      .use(new TimingMiddleware())
      .use(new LoggingMiddleware())
      .use(new ErrorHandlingMiddleware())
      .use(new SecurityMiddleware({
        enableCors: true
      }))
      .use(new CachingMiddleware())
      .build();

    this.container.registerSingleton('pipeline', pipeline);

    this.logger.info('IoC Container initialized');
  }

  private async initializeMiddleware(): Promise<void> {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true
    }));
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use(requestLogger(this.logger));

    // Observability middleware
    if (this.config.metrics.enabled) {
      this.app.use(this.metrics.middleware());
    }

    if (this.config.tracing.enabled) {
      this.app.use(this.tracing.middleware());
    }
  }

  private async initializeRoutes(): Promise<void> {
    // Health check (no authentication)
    this.app.get('/health', HealthController.health);

    // Metrics endpoint
    if (this.config.metrics.enabled) {
      this.app.get('/metrics', this.metrics.handler());
    }

    // API routes with pipeline
    const apiRouter = express.Router();

    // Component routes
    apiRouter.get('/components', ComponentController.getComponents);
    apiRouter.get('/components/:type', ComponentController.getComponent);
    apiRouter.post('/components', ComponentController.createComponent);
    apiRouter.put('/components/:type', ComponentController.updateComponent);
    apiRouter.delete('/components/:type', ComponentController.deleteComponent);
    apiRouter.get('/components/:type/metadata', ComponentController.getMetadata);
    apiRouter.post('/components/:type/validate', ComponentController.validateComponent);

    // Plugin routes
    apiRouter.get('/plugins', PluginController.getPlugins);
    apiRouter.get('/plugins/:name', PluginController.getPlugin);
    apiRouter.post('/plugins', PluginController.loadPlugin);
    apiRouter.delete('/plugins/:name', PluginController.unloadPlugin);
    apiRouter.get('/plugins/:name/dependencies', PluginController.getDependencies);

    // Registry routes
    apiRouter.get('/registry/search', ComponentController.search);
    apiRouter.get('/registry/categories', ComponentController.getCategories);
    apiRouter.get('/registry/stats', ComponentController.getRegistryStats);

    // Apply pipeline to API routes
    this.app.use('/api/v1', MiddlewareController.applyPipeline(apiRouter, this.container));

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
      });
    });

    // Error handler (must be last)
    this.app.use(errorHandler(this.logger));
  }

  private async registerWithConsul(): Promise<void> {
    if (!this.config.consul.url) {
      this.logger.warn('Consul URL not configured, skipping service registration');
      return;
    }

    try {
      const consul = require('consul')({ host: this.config.consul.url });

      await consul.agent.service.register({
        id: this.config.consul.service.id,
        name: this.config.consul.service.name,
        tags: this.config.consul.service.tags,
        address: process.env.HOSTNAME || 'localhost',
        port: this.config.port,
        check: {
          http: `http://localhost:${this.config.port}/health`,
          interval: '10s',
          timeout: '5s'
        }
      });

      this.logger.info('Service registered with Consul', {
        serviceId: this.config.consul.service.id,
        serviceName: this.config.consul.service.name
      });
    } catch (error) {
      this.logger.warn('Failed to register with Consul', { error });
    }
  }

  private async deregisterFromConsul(): Promise<void> {
    if (!this.config.consul.url) {
      return;
    }

    try {
      const consul = require('consul')({ host: this.config.consul.url });
      await consul.agent.service.deregister(this.config.consul.service.id);
      this.logger.info('Service deregistered from Consul');
    } catch (error) {
      this.logger.warn('Failed to deregister from Consul', { error });
    }
  }

  private async startServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = createServer(this.app)
        .listen(this.config.port, () => {
          resolve();
        })
        .on('error', reject);

      // Graceful shutdown
      process.on('SIGTERM', () => this.stop());
      process.on('SIGINT', () => this.stop());
    });
  }

  private async shutdownServer(): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => {
        resolve();
      });
    });
  }
}

// Start the service
const service = new ComponentRegistryService();
service.start().catch((error) => {
  console.error('Failed to start service:', error);
  process.exit(1);
});

export default ComponentRegistryService;