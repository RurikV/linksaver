/**
 * CMS Architecture Specification
 *
 * SOLID Principles Implementation:
 *
 * S - Single Responsibility: Each class has one reason to change
 * O - Open/Closed: Open for extension, closed for modification
 * L - Liskov Substitution: Components can be substituted with their subtypes
 * I - Interface Segregation: Small, focused interfaces
 * D - Dependency Inversion: Depend on abstractions, not concretions
 *
 * Design Patterns Used:
 *
 * 1. IoC Container - Dependency Injection
 * 2. Plugin Registry - Component discovery
 * 3. Pipeline/Chain of Responsibility - Request processing
 * 4. Composite - Component hierarchy
 * 5. Builder - Page construction
 * 6. Strategy - Rendering strategies
 * 7. Observer - Component lifecycle
 * 8. Proxy - Access control
 * 9. Decorator - Component enhancement
 * 10. Template Method - Component lifecycle
 * 11. Abstract Factory - Component creation
 * 12. Service Locator - Dependency resolution
 *
 * Microservices Architecture:
 *
 * - Component Registry Service
 * - Rendering Service
 * - Page Builder Service
 * - Template Service
 * - Asset Service
 * - Configuration Service
 */

import { IoCContainer } from './container/IoCContainer';

// ==================== CORE INTERFACES ====================

/**
 * Abstract base component interface
 * Follows Interface Segregation Principle
 */
interface IComponent {
  readonly id: string;
  readonly type: string;
  readonly metadata: ComponentMetadata;

  initialize(context: ComponentContext): Promise<void>;
  render(context: RenderContext): Promise<RenderResult>;
  validate(): ValidationResult;
  dispose(): Promise<void>;
}

/**
 * Component lifecycle interface
 * Template Method Pattern
 */
interface IComponentLifecycle {
  onBeforeInit?(component: IComponent): Promise<void>;
  onAfterInit?(component: IComponent): Promise<void>;
  onBeforeRender?(component: IComponent): Promise<void>;
  onAfterRender?(component: IComponent, result: RenderResult): Promise<void>;
  onBeforeDestroy?(component: IComponent): Promise<void>;
  onAfterDestroy?(component: IComponent): Promise<void>;
}

/**
 * Plugin interface for dynamic component loading
 * Open/Closed Principle
 */
interface IComponentPlugin {
  readonly name: string;
  readonly version: string;
  readonly dependencies: string[];

  register(container: IoCContainer): Promise<void>;
  getComponentFactories(): Map<string, IComponentFactory>;
  unregister(container: IoCContainer): Promise<void>;
}

/**
 * Rendering strategy interface
 * Strategy Pattern
 */
interface IRenderingStrategy {
  readonly name: string;
  readonly supportedFormats: string[];

  canRender(component: IComponent, format: string): boolean;
  render(component: IComponent, context: RenderContext): Promise<RenderResult>;
}

/**
 * Pipeline middleware interface
 * Chain of Responsibility Pattern
 */
interface IPipelineMiddleware {
  readonly name: string;
  readonly priority: number;

  execute(context: PipelineContext, next: () => Promise<void>): Promise<void>;
}

/**
 * Page builder interface
 * Builder Pattern
 */
interface IPageBuilder {
  reset(): IPageBuilder;
  setMetadata(metadata: PageMetadata): IPageBuilder;
  addComponent(component: IComponent, position?: ComponentPosition): IPageBuilder;
  addComponents(components: Array<{
    component: IComponent;
    position?: Partial<ComponentPosition>;
  }>): IPageBuilder;
  setLayout(layout: PageLayout): IPageBuilder;
  setTheme(theme: ThemeConfig): IPageBuilder;
  build(): Promise<Page>;
}

// ==================== DOMAIN MODELS ====================

type ComponentMetadata = {
  name: string;
  description?: string;
  category: string;
  tags: string[];
  configuration: ComponentConfiguration;
  dependencies: string[];
  permissions?: string[];
};

type ComponentConfiguration = Record<string, any>;

type ComponentContext = {
  pageId: string;
  requestContext: RequestContext;
  services: ServiceContainer;
  cache: ICacheProvider;
};

type RenderContext = ComponentContext & {
  format: 'html' | 'json' | 'xml' | 'ssr';
  theme: ThemeConfig;
  assets: AssetManager;
  locale: string;
  isPreview: boolean;
};

type RenderResult = {
  content: string;
  assets: AssetReference[];
  metadata: RenderMetadata;
  status: 'success' | 'partial' | 'error';
  errors?: RenderError[];
};

type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
};

type PipelineContext = {
  request: RequestContext;
  response: ResponseContext;
  page: Page | null;
  component: IComponent | null;
  metadata: Map<string, any>;
};

type PageMetadata = {
  title: string;
  description?: string;
  keywords?: string[];
  author?: string;
  locale: string;
  seo: SEOConfiguration;
};

type ComponentPosition = {
  zone: string;
  order: number;
  width?: string;
  height?: string;
  responsive?: {
    mobile?: Partial<ComponentPosition>;
    tablet?: Partial<ComponentPosition>;
    desktop?: Partial<ComponentPosition>;
  };
};

type PageLayout = {
  type: string;
  zones: LayoutZone[];
  responsive: ResponsiveConfiguration;
};

type LayoutZone = {
  id: string;
  type: 'container' | 'slot' | 'dynamic';
  components: IComponent[];
  configuration?: ComponentConfiguration;
};

// ==================== EXPORTS ====================

// Core Interfaces
export {
  IComponent,
  IComponentLifecycle,
  IComponentPlugin,
  IRenderingStrategy,
  IPipelineMiddleware,
  IPageBuilder
};

// Type Definitions
export type {
  ComponentMetadata,
  ComponentConfiguration,
  ComponentContext,
  RenderContext,
  RenderResult,
  ValidationResult,
  PipelineContext,
  PageMetadata,
  ComponentPosition,
  PageLayout,
  LayoutZone
};

// Additional interfaces that need to be defined (placeholder implementations)
export interface IComponentFactory {
  create(type: string, metadata: ComponentMetadata): Promise<IComponent>;
  canCreate(type: string): boolean;
  getSupportedTypes(): string[];
  getMetadata(): ComponentMetadata;
}

// Import the actual IoCContainer and types from their implementation files
export { IoCContainer, ServiceLifetime, ServiceRegistration } from './container/IoCContainer';
export { ServiceIdentifier, Constructor } from './container/types';

export interface Page {
  id: string;
  metadata: PageMetadata;
  layout: PageLayout;
  components: Map<string, IComponent>;
  theme: ThemeConfig;
  zoneComponents?: Map<string, IComponent[]>;
  buildDate?: Date;
  version?: string;
  status?: 'active' | 'inactive' | 'draft';
}

export interface ThemeConfig {
  name: string;
  colors: Record<string, string>;
  fonts: Record<string, string>;
  typography: {
    fontFamily: string;
    fontSize: {
      base: string;
      small: string;
      large: string;
      heading: string;
    };
  };
  spacing: Record<string, string>;
  breakpoints: Record<string, string>;
}

export interface ICacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
}

export interface ServiceContainer {
  get<T>(key: string): T;
  register<T>(key: string, service: T): void;
  has(key: string): boolean;
}

export interface RequestContext {
  id: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  params: Record<string, string>;
  body?: any;
  user?: any;
}

export interface ResponseContext {
  status: number;
  headers: Record<string, string>;
  body?: any;
}

export interface AssetReference {
  id: string;
  type: 'css' | 'js' | 'image' | 'font' | 'other';
  url: string;
  integrity?: string;
  crossOrigin?: string;
}

export interface RenderMetadata {
  component?: string;
  error?: string;
  timestamp?: string;
  [key: string]: any;
}

export interface RenderError {
  code: string;
  message: string;
  severity: 'error' | 'warning';
  component?: string;
}

export interface ValidationError {
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  path?: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
  severity: 'warning' | 'info';
  path?: string;
}

export interface ResponsiveConfiguration {
  mobile: Record<string, any>;
  tablet: Record<string, any>;
  desktop: Record<string, any>;
}

export interface SEOConfiguration {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  robots?: string;
  openGraph?: Record<string, any>;
  jsonLd?: Record<string, any>;
}

export interface AssetManager {
  addAsset(asset: AssetReference): void;
  getAssets(type?: string): AssetReference[];
  removeAsset(id: string): boolean;
  clear(): void;
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Helper function to safely extract error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message);
  }
  return 'An unknown error occurred';
}

/**
 * Helper function to safely extract error code from unknown error type
 */
export function getErrorCode(error: unknown): string {
  if (error instanceof Error) {
    return error.name;
  }
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return String(error.code);
  }
  return 'UNKNOWN_ERROR';
}