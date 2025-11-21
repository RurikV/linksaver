# Universal CMS Core Framework

[![npm version](https://badge.fury.io/js/%40universal-cms%2Fcore.svg)](https://badge.fury.io/js/%40universal-cms%2Fcore)
[![Build Status](https://github.com/universal-cms/core/workflows/CI/badge.svg)](https://github.com/universal-cms/core/actions)
[![Coverage](https://img.shields.io/badge/coverage-91%25-brightgreen.svg)](https://github.com/universal-cms/core/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-blue.svg)](https://www.typescriptlang.org/)

A modular, extensible Content Management System framework built with TypeScript and modern design patterns.

## 🚀 Features

### Core Architecture
- **🏗️ Modular Design**: Plug-and-play component architecture
- **🔗 Dependency Injection**: IoC Container for service management
- **🧩 Component System**: Base components with inheritance and composition
- **📦 Plugin Architecture**: Extensible plugin system
- **🎨 Theme Support**: Configurable theming system
- **🏛️ Builder Pattern**: Fluent API for page construction

### Advanced Features
- **⚡ Performance Optimized**: Efficient rendering and caching
- **🛡️ Type Safe**: Full TypeScript support with strict typing
- **🔄 Event System**: Reactive event-driven architecture
- **📝 Validation**: Built-in validation system
- **🌐 Environment Agnostic**: Works in Node.js and browser
- **🔧 Developer Friendly**: Comprehensive APIs and tools

## 📦 Installation

```bash
# Using npm
npm install @universal-cms/core

# Using yarn
yarn add @universal-cms/core

# Using pnpm
pnpm add @universal-cms/core
```

## 🎯 Quick Start

```typescript
import { IoCContainer, ServiceLifetime } from '@universal-cms/core';
import { BaseComponent, PageBuilder } from '@universal-cms/core';

// Initialize the container
const container = new IoCContainer();

// Register services
container.register('ConfigService', ConfigService, ServiceLifetime.Singleton);

// Create a page
const pageBuilder = new PageBuilder();
const page = pageBuilder
  .setTitle('My Page')
  .setTheme('modern')
  .addComponent('header', HeaderComponent)
  .addComponent('content', ContentComponent)
  .build();

// Render the page
const result = await page.render();
console.log(result.html);
```

## 🏗️ Architecture

### Component System

```typescript
import { BaseComponent, ComponentMetadata } from '@universal-cms/core';

class MyComponent extends BaseComponent {
  constructor(metadata: ComponentMetadata) {
    super(metadata);
  }

  async render(context: RenderContext): Promise<RenderResult> {
    return {
      html: `<div class="my-component">${this.props.content}</div>`,
      css: `.my-component { color: blue; }`,
      js: `console.log('Component loaded');`
    };
  }
}
```

### Dependency Injection

```typescript
import { IoCContainer, ServiceLifetime } from '@universal-cms/core';

// Container setup
const container = new IoCContainer();

// Register services
container.register('DatabaseService', DatabaseService, ServiceLifetime.Singleton);
container.register('CacheService', CacheService, ServiceLifetime.Scoped);

// Resolve services
const db = container.resolve<DatabaseService>('DatabaseService');
const cache = container.resolve<CacheService>('CacheService');
```

### Plugin System

```typescript
import { ComponentRegistry } from '@universal-cms/core';

const registry = new ComponentRegistry(container);

// Register plugin
registry.registerPlugin(new SeoPlugin());
registry.registerPlugin(new AnalyticsPlugin());

// Register component
registry.registerComponent('blog-post', BlogPostComponent, {
  category: 'content',
  tags: ['blog', 'content'],
  configuration: {
    excerptLength: 150,
    enableComments: true
  }
});
```

## 📚 API Documentation

### Core Classes

#### IoCContainer
The dependency injection container for managing services and their lifetimes.

```typescript
class IoCContainer {
  register<T>(name: string, factory: ServiceFactory<T>, lifetime?: ServiceLifetime): void;
  registerSingleton<T>(name: string, factory: ServiceFactory<T>): void;
  registerScoped<T>(name: string, factory: ServiceFactory<T>): void;
  registerTransient<T>(name: string, factory: ServiceFactory<T>): void;
  resolve<T>(name: string): T;
  isRegistered(name: string): boolean;
  dispose(): void;
}
```

#### BaseComponent
The foundation class for all CMS components.

```typescript
abstract class BaseComponent {
  constructor(metadata: ComponentMetadata);
  abstract render(context: RenderContext): Promise<RenderResult>;
  validate(): ValidationResult;
  getConfig<T>(key: string, defaultValue?: T): T;
  setConfig(key: string, value: any): void;
}
```

#### PageBuilder
Fluent interface for building pages and managing layouts.

```typescript
class PageBuilder {
  setTitle(title: string): PageBuilder;
  setTheme(theme: string | ThemeConfig): PageBuilder;
  setMetadata(metadata: PageMetadata): PageBuilder;
  addComponent(id: string, component: string | IComponent, position?: ComponentPosition): PageBuilder;
  build(): Page;
}
```

### Configuration

#### Component Metadata
```typescript
interface ComponentMetadata {
  name: string;
  category: string;
  tags: string[];
  configuration: Record<string, any>;
  dependencies?: string[];
  lifecycle?: {
    initialize?: boolean;
    dispose?: boolean;
  };
}
```

#### Theme Configuration
```typescript
interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  typography: {
    fontFamily: string;
    fontSize: Record<string, number>;
  };
  spacing: Record<string, number>;
  breakpoints: Record<string, number>;
  fonts?: string[];
}
```

## 🔧 Development

### Prerequisites
- Node.js 18+
- TypeScript 5.2+
- npm 9+

### Setup

```bash
# Clone the repository
git clone https://github.com/universal-cms/core.git
cd core

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Start development mode
npm run dev
```

### Building

```bash
# Clean and build
npm run build

# Watch mode for development
npm run dev

# Type checking only
npm run type-check
```

### Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Linting

```bash
# Check for linting issues
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📖 Examples

### Creating a Custom Component

```typescript
import { BaseComponent, ComponentMetadata, RenderContext, RenderResult } from '@universal-cms/core';

interface BlogPostProps {
  title: string;
  content: string;
  author: string;
  publishDate: Date;
  tags: string[];
}

class BlogPostComponent extends BaseComponent {
  private props: BlogPostProps;

  constructor(metadata: ComponentMetadata) {
    super(metadata);
    this.props = this.getConfig('defaultProps', {}) as BlogPostProps;
  }

  async render(context: RenderContext): Promise<RenderResult> {
    const formattedDate = this.props.publishDate.toLocaleDateString();

    return {
      html: `
        <article class="blog-post">
          <header class="blog-post-header">
            <h1>${this.props.title}</h1>
            <div class="blog-meta">
              <span class="author">By ${this.props.author}</span>
              <time datetime="${this.props.publishDate.toISOString()}">${formattedDate}</time>
            </div>
          </header>
          <div class="blog-content">
            ${this.props.content}
          </div>
          <footer class="blog-footer">
            <div class="tags">
              ${this.props.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
          </footer>
        </article>
      `,
      css: `
        .blog-post {
          margin: 2rem 0;
          padding: 1.5rem;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
        }
        .blog-post-header h1 {
          margin: 0 0 1rem 0;
          color: #333;
        }
        .blog-meta {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }
        .tag {
          display: inline-block;
          background: #f0f0f0;
          padding: 0.25rem 0.5rem;
          margin: 0.25rem;
          border-radius: 4px;
          font-size: 0.8rem;
        }
      `
    };
  }
}
```

### Advanced Plugin Development

```typescript
import { ICMSPlugin, PluginContext } from '@universal-cms/core';

class SeoPlugin implements ICMSPlugin {
  name = 'seo-plugin';
  version = '1.0.0';

  async initialize(context: PluginContext): Promise<void> {
    // Register SEO services
    context.container.registerSingleton('SeoService', SeoService);

    // Add SEO middleware to pipeline
    context.pipeline.addMiddleware(new SeoMiddleware());
  }

  async dispose(): Promise<void> {
    // Cleanup resources
  }
}

class SeoMiddleware implements IPipelineMiddleware {
  async execute(context: PipelineContext, next: () => Promise<void>): Promise<void> {
    // Add SEO metadata to response
    if (context.response.data) {
      context.response.headers['x-seo-score'] = '95';
      context.response.meta = {
        title: context.page.title,
        description: this.generateDescription(context.page.content),
        keywords: this.extractKeywords(context.page.content)
      };
    }

    await next();
  }

  private generateDescription(content: string): string {
    return content.substring(0, 160) + '...';
  }

  private extractKeywords(content: string): string[] {
    // Advanced keyword extraction logic
    return content.split(' ').filter(word => word.length > 5).slice(0, 10);
  }
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- Follow [TypeScript style guidelines](https://typescript-eslint.io/)
- Write comprehensive tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TypeScript](https://www.typescriptlang.org/) - For the amazing type system
- [Jest](https://jestjs.io/) - For the excellent testing framework
- The open-source community for inspiration and feedback

## 📞 Support

- 📖 [Documentation](https://universal-cms.github.io/core)
- 🐛 [Issue Tracker](https://github.com/universal-cms/core/issues)
- 💬 [Discussions](https://github.com/universal-cms/core/discussions)
- 📧 [Email](mailto:support@universal-cms.com)

---

**Built with ❤️ by the Universal CMS Team**