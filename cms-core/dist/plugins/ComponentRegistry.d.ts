/**
 * Component Registry - Plugin System
 *
 * Implements:
 * - Registry Pattern for component discovery
 * - Plugin Pattern for dynamic loading
 * - Factory Pattern for component creation
 * - Observer Pattern for registry events
 *
 * SOLID Compliance:
 * O: Open/Closed - can register new components without modification
 * D: Dependency Inversion - depends on component interfaces
 * I: Interface Segregation - focused registry interface
 */
import { IComponent, IComponentPlugin, IComponentFactory, ComponentMetadata } from '../interfaces';
import { IoCContainer } from '../container/IoCContainer';
export interface ComponentRegistration {
    type: string;
    factory: IComponentFactory;
    plugin?: IComponentPlugin;
    metadata: ComponentMetadata;
    registrationDate: Date;
}
export interface RegistryEvent {
    type: 'component-registered' | 'component-unregistered' | 'plugin-loaded' | 'plugin-unloaded';
    data: any;
    timestamp: Date;
}
/**
 * Component Registry for dynamic plugin management
 * Handles component discovery, registration, and lifecycle
 */
export declare class ComponentRegistry {
    private components;
    private plugins;
    private eventListeners;
    private container;
    constructor(container: IoCContainer);
    /**
     * Register a component factory
     */
    registerComponent(type: string, factory: IComponentFactory, metadata: ComponentMetadata, plugin?: IComponentPlugin): void;
    /**
     * Unregister a component
     */
    unregisterComponent(type: string): void;
    /**
     * Load and register a plugin
     */
    loadPlugin(plugin: IComponentPlugin): Promise<void>;
    /**
     * Unload a plugin
     */
    unloadPlugin(name: string): Promise<void>;
    /**
     * Create a component instance
     */
    createComponent(type: string, id: string, configuration?: any): Promise<IComponent>;
    /**
     * Get component metadata
     */
    getMetadata(type: string): ComponentMetadata | undefined;
    /**
     * Check if component type is registered
     */
    isRegistered(type: string): boolean;
    /**
     * Get all registered component types
     */
    getComponentTypes(): string[];
    /**
     * Get components by category
     */
    getComponentsByCategory(category: string): string[];
    /**
     * Get loaded plugins
     */
    getLoadedPlugins(): string[];
    /**
     * Get plugin information
     */
    getPluginInfo(name: string): IComponentPlugin | undefined;
    /**
     * Search components
     */
    searchComponents(query: string): string[];
    /**
     * Add event listener
     */
    addEventListener(event: string, listener: (event: RegistryEvent) => void): void;
    /**
     * Remove event listener
     */
    removeEventListener(event: string, listener: (event: RegistryEvent) => void): void;
    /**
     * Validate component metadata
     */
    private validateMetadata;
    /**
     * Check plugin dependencies
     */
    private checkDependencies;
    /**
     * Emit registry event
     */
    private emitEvent;
}
