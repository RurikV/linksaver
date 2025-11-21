# IoC, Dependency Injection, and Explicit Dependency Resolution

## Overview

Inversion of Control (IoC) and Dependency Injection (DI) are design patterns that promote loose coupling, testability, and maintainability by inverting the flow of control and explicitly managing dependencies between components.

## Core Concepts

### 1. Inversion of Control (IoC)

**Traditional Control Flow:**
```
Application → Creates Dependencies → Uses Dependencies
```

**IoC Control Flow:**
```
Application → Requests Dependencies → Container Provides Dependencies
```

IoC is the principle where the control of object creation and dependency management is transferred from the application code to an external container or framework.

### 2. Dependency Injection (DI)

DI is the concrete implementation of IoC where dependencies are "injected" into components rather than being created internally.

**Types of Dependency Injection:**

#### Constructor Injection
```javascript
class LinkService {
  constructor(database, logger, cache) {
    this.database = database;
    this.logger = logger;
    this.cache = cache;
  }
}
```

#### Property Injection
```javascript
class LinkService {
  setDatabase(database) { this.database = database; }
  setLogger(logger) { this.logger = logger; }
  setCache(cache) { this.cache = cache; }
}
```

#### Interface Injection
```javascript
class LinkService {
  inject(dependency) {
    if (dependency.type === 'database') this.database = dependency.instance;
    if (dependency.type === 'logger') this.logger = dependency.instance;
  }
}
```

### 3. Explicit Dependency Resolution

Explicit dependency resolution means clearly declaring what dependencies a component needs, making the code self-documenting and easier to understand.

## IoC Container Architecture

### Container Responsibilities

1. **Registration** - Component and dependency registration
2. **Resolution** - Creating instances and resolving dependencies
3. **Lifecycle Management** - Singleton, transient, scoped instances
4. **Configuration** - Dependency binding and configuration
5. **Auto-wiring** - Automatic dependency resolution

### Container Implementation Example

```javascript
class IoCContainer {
  constructor() {
    this.services = new Map();
    this.instances = new Map();
    this.singletons = new Set();
  }

  // Register a service with its dependencies
  register(name, factory, options = {}) {
    this.services.set(name, {
      factory,
      dependencies: options.dependencies || [],
      singleton: options.singleton || false
    });

    if (options.singleton) {
      this.singletons.add(name);
    }
  }

  // Resolve a service with all its dependencies
  resolve(name) {
    // Check if singleton instance exists
    if (this.singletons.has(name) && this.instances.has(name)) {
      return this.instances.get(name);
    }

    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not registered`);
    }

    // Resolve all dependencies first
    const dependencies = service.dependencies.map(dep => this.resolve(dep));

    // Create instance with resolved dependencies
    const instance = service.factory(...dependencies);

    // Store singleton instances
    if (this.singletons.has(name)) {
      this.instances.set(name, instance);
    }

    return instance;
  }
}
```

## LinkSaver IoC Implementation

### Service Registration

```javascript
// Initialize container
const container = new IoCContainer();

// Register core services
container.register('database', () => new MongoDBConnection(), {
  singleton: true
});

container.register('logger', () => new WinstonLogger(), {
  singleton: true
});

container.register('cache', () => new RedisClient(), {
  singleton: true
});

container.register('emailService', (logger) => new EmailService(logger), {
  dependencies: ['logger'],
  singleton: true
});

// Register application services
container.register('linkRepository', (database, logger) => new LinkRepository(database, logger), {
  dependencies: ['database', 'logger'],
  singleton: true
});

container.register('userService', (userRepository, logger, emailService) => new UserService(userRepository, logger, emailService), {
  dependencies: ['userRepository', 'logger', 'emailService'],
  singleton: true
});

container.register('linkService', (linkRepository, cache, logger) => new LinkService(linkRepository, cache, logger), {
  dependencies: ['linkRepository', 'cache', 'logger']
});
```

### Service Usage

```javascript
// Instead of manual dependency creation:
// const db = new MongoDBConnection();
// const logger = new WinstonLogger();
// const linkService = new LinkService(db, logger);

// Use container to resolve with automatic dependency injection:
const linkService = container.resolve('linkService');
// Container automatically provides: linkRepository, cache, logger
```

## Benefits of IoC and DI

### 1. Loose Coupling
Components don't need to know how to create their dependencies, only what interfaces they implement.

### 2. Testability
Easy to mock dependencies for unit testing:
```javascript
// Test with mock dependencies
const mockDatabase = new MockDatabase();
const mockLogger = new MockLogger();

testContainer.register('database', () => mockDatabase);
testContainer.register('logger', () => mockLogger);

const service = testContainer.resolve('linkService');
```

### 3. Maintainability
Changes to dependency implementations don't require changes to consuming code.

### 4. Configuration Flexibility
Different implementations can be easily swapped:
```javascript
// Development
container.register('database', () => new MongoDBConnection());

// Production
container.register('database', () => new PostgreSQLConnection());

// Testing
container.register('database', () => new InMemoryDatabase());
```

### 5. Lifecycle Management
Automatic management of object lifecycles (singleton, transient, scoped).

## Advanced Patterns

### 1. Auto-Registration
```javascript
class AutoRegistrationContainer extends IoCContainer {
  scanAndRegister(directory) {
    const services = this.loadServicesFromDirectory(directory);
    services.forEach(service => {
      this.register(service.name, service.factory, service.options);
    });
  }
}
```

### 2. Decorator-Based Registration
```javascript
@Injectable({ singleton: true })
class LinkService {
  constructor(@Inject('database') database, @Inject('logger') logger) {
    this.database = database;
    this.logger = logger;
  }
}

// Automatic registration with decorators
container.registerClass(LinkService);
```

### 3. Circular Dependency Resolution
```javascript
class CircularDependencyResolver {
  resolve(container, name, resolving = new Set()) {
    if (resolving.has(name)) {
      throw new Error(`Circular dependency detected: ${Array.from(resolving).join(' -> ')} -> ${name}`);
    }

    resolving.add(name);
    const instance = container.resolve(name);
    resolving.delete(name);

    return instance;
  }
}
```

### 4. Dependency Scopes
```javascript
// Request scope - new instance per HTTP request
container.register('requestContext', () => new RequestContext(), {
  scope: 'request'
});

// Session scope - one instance per user session
container.register('userSession', () => new UserSession(), {
  scope: 'session'
});

// Singleton scope - one instance for entire application
container.register('database', () => new DatabaseConnection(), {
  scope: 'singleton'
});
```

## Configuration Management

### Environment-Based Configuration
```javascript
class ConfigurationManager {
  static configureContainer(container, environment) {
    const config = this.loadConfig(environment);

    // Register configuration values
    Object.keys(config).forEach(key => {
      container.register(`config.${key}`, () => config[key], {
        singleton: true
      });
    });

    // Register environment-specific implementations
    this.registerImplementations(container, config);
  }

  static registerImplementations(container, config) {
    if (config.database.type === 'mongodb') {
      container.register('database', () => new MongoDBConnection(config.database));
    } else if (config.database.type === 'postgresql') {
      container.register('database', () => new PostgreSQLConnection(config.database));
    }
  }
}
```

## Performance Considerations

### 1. Lazy Loading
```javascript
class LazyContainer extends IoCContainer {
  register(name, factory, options = {}) {
    super.register(name, factory, options);
    if (options.lazy) {
      this.lazyServices.add(name);
    }
  }

  resolve(name) {
    if (this.lazyServices.has(name) && !this.instances.has(name)) {
      // Create instance only when first requested
      return super.resolve(name);
    }
    return super.resolve(name);
  }
}
```

### 2. Dependency Caching
```javascript
class CachedContainer extends IoCContainer {
  constructor() {
    super();
    this.dependencyCache = new Map();
  }

  resolve(name) {
    const cacheKey = this.buildDependencyGraph(name);
    if (this.dependencyCache.has(cacheKey)) {
      return this.dependencyCache.get(cacheKey);
    }

    const instance = super.resolve(name);
    this.dependencyCache.set(cacheKey, instance);
    return instance;
  }
}
```

## Best Practices

### 1. Prefer Constructor Injection
Makes dependencies explicit and immutable.

### 2. Use Interfaces
Depend on abstractions, not concretions:
```javascript
// Good - depends on interface
class LinkService {
  constructor(@Inject('IDatabase') database) {
    this.database = database;
  }
}

// Bad - depends on concrete implementation
class LinkService {
  constructor(mongoDB) {
    this.database = mongoDB;
  }
}
```

### 3. Keep Container Configuration Centralized
Maintain dependency registration in one place for clarity.

### 4. Avoid Service Locator Pattern
Don't inject the container into services - this defeats the purpose of DI.

### 5. Use Appropriate Lifecycles
Choose singleton, transient, or scoped based on usage patterns.

### 6. Document Dependencies
Make dependencies clear through naming and documentation.

## Error Handling

### Common Issues and Solutions

1. **Missing Dependencies**
   ```javascript
   try {
     const service = container.resolve('missingService');
   } catch (error) {
     console.log('Service not registered:', error.message);
   }
   ```

2. **Circular Dependencies**
   ```javascript
   class CircularDependencyDetector {
     detect(container, service, visited = new Set()) {
     if (visited.has(service)) {
       throw new Error(`Circular dependency: ${Array.from(visited).join(' -> ')} -> ${service}`);
     }
     // ... detection logic
   }
   }
   ```

3. **Configuration Errors**
   ```javascript
   class ContainerValidator {
     validate(container) {
     // Check for missing required dependencies
     // Validate dependency contracts
     // Check for type mismatches
     }
   }
   ```

## Testing with IoC

### Unit Testing
```javascript
describe('LinkService', () => {
  let linkService;
  let mockDatabase;
  let mockCache;

  beforeEach(() => {
    const testContainer = new IoCContainer();

    mockDatabase = {
      save: jest.fn(),
      findById: jest.fn()
    };

    mockCache = {
      get: jest.fn(),
      set: jest.fn()
    };

    testContainer.register('database', () => mockDatabase);
    testContainer.register('cache', () => mockCache);
    testContainer.register('logger', () => new MockLogger());

    linkService = testContainer.resolve('linkService');
  });

  test('should save link with caching', async () => {
    // Test implementation
  });
});
```

### Integration Testing
```javascript
describe('Integration Tests', () => {
  let container;

  beforeAll(() => {
    container = new TestContainer();
    container.register('database', () => new TestDatabase());
    container.register('cache', () => new TestCache());
  });

  test('end-to-end link workflow', async () => {
    const linkService = container.resolve('linkService');
    // Integration test implementation
  });
});
```

This IoC and DI system provides LinkSaver with a robust, maintainable, and testable architecture that separates concerns and promotes loose coupling between components.