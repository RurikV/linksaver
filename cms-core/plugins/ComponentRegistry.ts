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

import { IComponent, IComponentPlugin, IComponentFactory, ComponentMetadata, getErrorMessage } from '../interfaces';
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
export class ComponentRegistry {
  private components = new Map<string, ComponentRegistration>();
  private plugins = new Map<string, IComponentPlugin>();
  private eventListeners: Map<string, ((event: RegistryEvent) => void)[]> = new Map();
  private container: IoCContainer;

  constructor(container: IoCContainer) {
    this.container = container;
  }

  /**
   * Register a component factory
   */
  registerComponent(
    type: string,
    factory: IComponentFactory,
    metadata: ComponentMetadata,
    plugin?: IComponentPlugin
  ): void {
    if (this.components.has(type)) {
      throw new Error(`Component type already registered: ${type}`);
    }

    // Validate component metadata
    this.validateMetadata(metadata);

    const registration: ComponentRegistration = {
      type,
      factory,
      plugin,
      metadata,
      registrationDate: new Date()
    };

    this.components.set(type, registration);
    this.container.registerSingleton(`component:${type}`, factory);

    this.emitEvent({
      type: 'component-registered',
      data: { type, metadata, plugin: plugin?.name },
      timestamp: new Date()
    });
  }

  /**
   * Unregister a component
   */
  unregisterComponent(type: string): void {
    if (!this.components.has(type)) {
      throw new Error(`Component type not registered: ${type}`);
    }

    this.components.delete(type);
    this.container.registerSingleton(`component:${type}`, () => null);

    this.emitEvent({
      type: 'component-unregistered',
      data: { type },
      timestamp: new Date()
    });
  }

  /**
   * Load and register a plugin
   */
  async loadPlugin(plugin: IComponentPlugin): Promise<void> {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin already loaded: ${plugin.name}`);
    }

    // Check dependencies
    this.checkDependencies(plugin);

    try {
      await plugin.register(this.container);

      // Register plugin's component factories
      const factories = plugin.getComponentFactories();
      for (const [type, factory] of factories) {
        const metadata = factory.getMetadata();
        this.registerComponent(type, factory, metadata, plugin);
      }

      this.plugins.set(plugin.name, plugin);

      this.emitEvent({
        type: 'plugin-loaded',
        data: { name: plugin.name, version: plugin.version },
        timestamp: new Date()
      });
    } catch (error) {
      throw new Error(`Failed to load plugin ${plugin.name}: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Unload a plugin
   */
  async unloadPlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin not loaded: ${name}`);
    }

    try {
      // Remove plugin's components
      const factories = plugin.getComponentFactories();
      for (const [type] of factories) {
        const registration = this.components.get(type);
        if (registration?.plugin === plugin) {
          this.unregisterComponent(type);
        }
      }

      await plugin.unregister(this.container);
      this.plugins.delete(name);

      this.emitEvent({
        type: 'plugin-unloaded',
        data: { name },
        timestamp: new Date()
      });
    } catch (error) {
      throw new Error(`Failed to unload plugin ${name}: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Create a component instance
   */
  async createComponent(type: string, id: string, configuration?: any): Promise<IComponent> {
    const registration = this.components.get(type);
    if (!registration) {
      throw new Error(`Component type not registered: ${type}`);
    }

    try {
      const factory = registration.factory;
      const metadata = { ...registration.metadata };

      // Merge configuration with metadata
      if (configuration) {
        metadata.configuration = { ...metadata.configuration, ...configuration };
      }

      const component = await factory.createComponent(id, metadata);
      return component;
    } catch (error) {
      throw new Error(`Failed to create component ${type}: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Get component metadata
   */
  getMetadata(type: string): ComponentMetadata | undefined {
    return this.components.get(type)?.metadata;
  }

  /**
   * Check if component type is registered
   */
  isRegistered(type: string): boolean {
    return this.components.has(type);
  }

  /**
   * Get all registered component types
   */
  getComponentTypes(): string[] {
    return Array.from(this.components.keys());
  }

  /**
   * Get components by category
   */
  getComponentsByCategory(category: string): string[] {
    return Array.from(this.components.entries())
      .filter(([, registration]) => registration.metadata.category === category)
      .map(([type]) => type);
  }

  /**
   * Get loaded plugins
   */
  getLoadedPlugins(): string[] {
    return Array.from(this.plugins.keys());
  }

  /**
   * Get plugin information
   */
  getPluginInfo(name: string): IComponentPlugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * Search components
   */
  searchComponents(query: string): string[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.components.entries())
      .filter(([, registration]) => {
        const { metadata } = registration;
        return (
          metadata.name.toLowerCase().includes(lowerQuery) ||
          metadata.description?.toLowerCase().includes(lowerQuery) ||
          metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
      })
      .map(([type]) => type);
  }

  /**
   * Add event listener
   */
  addEventListener(event: string, listener: (event: RegistryEvent) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(event: string, listener: (event: RegistryEvent) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Validate component metadata
   */
  private validateMetadata(metadata: ComponentMetadata): void {
    if (!metadata.name || typeof metadata.name !== 'string') {
      throw new Error('Component metadata must have a valid name');
    }

    if (!metadata.category || typeof metadata.category !== 'string') {
      throw new Error('Component metadata must have a valid category');
    }

    if (!Array.isArray(metadata.tags)) {
      throw new Error('Component metadata tags must be an array');
    }

    if (!metadata.configuration || typeof metadata.configuration !== 'object') {
      throw new Error('Component metadata must have a configuration object');
    }
  }

  /**
   * Check plugin dependencies
   */
  private checkDependencies(plugin: IComponentPlugin): void {
    for (const dependency of plugin.dependencies) {
      if (!this.plugins.has(dependency)) {
        throw new Error(`Plugin dependency not found: ${dependency}`);
      }
    }
  }

  /**
   * Emit registry event
   */
  private emitEvent(event: RegistryEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in registry event listener for ${event.type}:`, error);
        }
      });
    }
  }
}