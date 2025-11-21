/**
 * IoC Container - Full Dependency Injection Implementation
 *
 * Implements:
 * - Service Locator Pattern
 * - Dependency Injection Principle
 * - Factory Pattern for service creation
 * - Singleton and scoped lifetime management
 *
 * SOLID Compliance:
 * D: Dependency Inversion - Depends on abstractions
 * O: Open/Closed - Extensible with new registrations
 * L: Liskov Substitution - Any implementation can be substituted
 */
import { ServiceIdentifier, Constructor } from './types';
export interface IServiceFactory {
    create(container: IoCContainer): any;
    dispose?(instance: any): void;
}
export declare enum ServiceLifetime {
    Transient = "transient",// New instance every time
    Singleton = "singleton",// Single instance for container lifetime
    Scoped = "scoped"
}
export interface ServiceRegistration {
    factory: IServiceFactory;
    lifetime: ServiceLifetime;
    dependencies?: ServiceIdentifier[];
    metadata?: ServiceMetadata;
}
export type ServiceMetadata = Record<string, any>;
/**
 * IoC Container with full DI support
 * Provides explicit dependency resolution and lifetime management
 */
export declare class IoCContainer {
    private registrations;
    private instances;
    private scopedInstances;
    private creating;
    private scopeId;
    /**
     * Register a service with the container
     * Supports factory functions, constructors, and instances
     */
    register<T>(identifier: ServiceIdentifier, factory: IServiceFactory | ((container: IoCContainer) => T) | Constructor<T> | T, lifetime?: ServiceLifetime, metadata?: ServiceMetadata): IoCContainer;
    /**
     * Register a singleton service
     */
    registerSingleton<T>(identifier: ServiceIdentifier, factory: IServiceFactory | ((container: IoCContainer) => T) | Constructor<T> | T, metadata?: ServiceMetadata): IoCContainer;
    /**
     * Register a scoped service
     */
    registerScoped<T>(identifier: ServiceIdentifier, factory: IServiceFactory | ((container: IoCContainer) => T) | Constructor<T> | T, metadata?: ServiceMetadata): IoCContainer;
    /**
     * Resolve a service from the container
     * Handles dependency injection and lifetime management
     */
    resolve<T>(identifier: ServiceIdentifier): T;
    /**
     * Check if a service is registered
     */
    isRegistered(identifier: ServiceIdentifier): boolean;
    /**
     * Get service metadata
     */
    getMetadata(identifier: ServiceIdentifier): ServiceMetadata | undefined;
    /**
     * Create a new scope
     */
    createScope(): IoCContainer;
    /**
     * Dispose container and cleanup resources
     */
    dispose(): Promise<void>;
    /**
     * Get instance based on lifetime
     */
    private getInstance;
    /**
     * Set instance based on lifetime
     */
    private setInstance;
    /**
     * Check if object is a service factory
     */
    private isServiceFactory;
    /**
     * Check if function is a constructor
     */
    private isConstructor;
    /**
     * Resolve constructor dependencies using reflection
     */
    private resolveConstructorDependencies;
}
