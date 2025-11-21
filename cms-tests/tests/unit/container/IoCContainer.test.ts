/**
 * IoC Container Unit Tests
 *
 * Comprehensive testing of:
 * - Service registration and resolution
 * - Lifetime management (Singleton, Scoped, Transient)
 * - Dependency injection
 * - Circular dependency detection
 * - Container scoping
 * - Error handling
 * - Performance under load
 *
 * SOLID Compliance Verification:
 * - D: Dependency Inversion Principle
 * - O: Open/Closed Principle
 * - L: Liskov Substitution Principle
 */

import { IoCContainer, ServiceLifetime } from '@cms/core/container';

describe('IoCContainer', () => {
  let container: IoCContainer;

  beforeEach(() => {
    container = new IoCContainer();
  });

  afterEach(async () => {
    await container.dispose();
  });

  describe('Service Registration', () => {
    it('should register and resolve a simple service', () => {
      // Arrange
      class TestService {
        getValue(): string {
          return 'test-value';
        }
      }

      // Act
      container.register('testService', TestService, ServiceLifetime.Singleton);
      const resolved = container.resolve('testService');

      // Assert
      expect(resolved).toBeInstanceOf(TestService);
      expect(resolved.getValue()).toBe('test-value');
    });

    it('should register and resolve a factory function', () => {
      // Arrange
      const factory = () => ({ value: 'factory-value' });

      // Act
      container.register('factoryService', factory, ServiceLifetime.Transient);
      const resolved = container.resolve('factoryService');

      // Assert
      expect(resolved).toEqual({ value: 'factory-value' });
    });

    it('should register and resolve an instance', () => {
      // Arrange
      const instance = { value: 'instance-value' };

      // Act
      container.register('instanceService', instance, ServiceLifetime.Singleton);
      const resolved = container.resolve('instanceService');

      // Assert
      expect(resolved).toBe(instance);
      expect(resolved.value).toBe('instance-value');
    });

    it('should throw error when registering duplicate service', () => {
      // Arrange
      class TestService {}
      container.register('testService', TestService);

      // Act & Assert
      expect(() => {
        container.register('testService', TestService);
      }).toThrow('Service type already registered: testService');
    });

    it('should handle different service identifier types', () => {
      // Arrange
      class StringService {}
      class SymbolService {}
      const symbol = Symbol('test');

      // Act
      container.register('stringKey', StringService);
      container.register(symbol, SymbolService);

      // Assert
      expect(container.resolve('stringKey')).toBeInstanceOf(StringService);
      expect(container.resolve(symbol)).toBeInstanceOf(SymbolService);
    });
  });

  describe('Service Lifetime Management', () => {
    it('should resolve singleton services as same instance', () => {
      // Arrange
      class SingletonService {}
      container.registerSingleton('singleton', SingletonService);

      // Act
      const first = container.resolve('singleton');
      const second = container.resolve('singleton');

      // Assert
      expect(first).toBe(second);
      expect(first).toBeInstanceOf(SingletonService);
    });

    it('should resolve transient services as different instances', () => {
      // Arrange
      class TransientService {
        public id = Math.random();
      }
      container.register('transient', TransientService, ServiceLifetime.Transient);

      // Act
      const first = container.resolve('transient');
      const second = container.resolve('transient');

      // Assert
      expect(first).not.toBe(second);
      expect(first.id).not.toBe(second.id);
    });

    it('should resolve scoped services within same scope as same instance', () => {
      // Arrange
      class ScopedService {
        public id = Math.random();
      }
      container.registerScoped('scoped', ScopedService);

      // Act
      const scope1 = container.createScope();
      const first1 = scope1.resolve('scoped');
      const second1 = scope1.resolve('scoped');

      const scope2 = container.createScope();
      const first2 = scope2.resolve('scoped');

      // Assert
      expect(first1).toBe(second1);
      expect(first1).not.toBe(first2);
    });

    it('should handle scoped services across different scopes', () => {
      // Arrange
      class ScopedService {
        public id = Math.random();
      }
      container.registerScoped('scoped', ScopedService);

      // Act
      const scope1 = container.createScope();
      const instance1 = scope1.resolve('scoped');

      const scope2 = container.createScope();
      const instance2 = scope2.resolve('scoped');

      // Assert
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('Dependency Injection', () => {
    it('should resolve services with constructor dependencies', () => {
      // Arrange
      class DependencyService {
        public value = 'dependency-value';
      }

      class MainService {
        constructor(public dependency: DependencyService) {}

        getValue(): string {
          return this.dependency.value;
        }
      }

      container.registerSingleton('dependency', DependencyService);
      container.registerSingleton('main', MainService);

      // Act
      const resolved = container.resolve('main');

      // Assert
      expect(resolved).toBeInstanceOf(MainService);
      expect(resolved.dependency).toBeInstanceOf(DependencyService);
      expect(resolved.getValue()).toBe('dependency-value');
    });

    it('should resolve nested dependencies', () => {
      // Arrange
      class ServiceA {
        public value = 'service-a';
      }

      class ServiceB {
        constructor(public serviceA: ServiceA) {}
      }

      class ServiceC {
        constructor(public serviceB: ServiceB) {}

        getValue(): string {
          return this.serviceB.serviceA.value;
        }
      }

      container.registerSingleton('serviceA', ServiceA);
      container.registerSingleton('serviceB', ServiceB);
      container.registerSingleton('serviceC', ServiceC);

      // Act
      const resolved = container.resolve('serviceC');

      // Assert
      expect(resolved).toBeInstanceOf(ServiceC);
      expect(resolved.getValue()).toBe('service-a');
    });

    it('should handle circular dependency detection', () => {
      // Arrange
      class ServiceA {
        constructor(public serviceB: ServiceB) {}
      }

      class ServiceB {
        constructor(public serviceA: ServiceA) {}
      }

      container.registerSingleton('serviceA', ServiceA);
      container.registerSingleton('serviceB', ServiceB);

      // Act & Assert
      expect(() => {
        container.resolve('serviceA');
      }).toThrow('Circular dependency detected');
    });
  });

  describe('Container Management', () => {
    it('should check if service is registered', () => {
      // Arrange
      class TestService {}
      container.register('testService', TestService);

      // Act & Assert
      expect(container.isRegistered('testService')).toBe(true);
      expect(container.isRegistered('nonExistent')).toBe(false);
    });

    it('should get service metadata', () => {
      // Arrange
      class TestService {}
      const metadata = { category: 'test', tags: ['unit'] };
      container.register('testService', TestService, ServiceLifetime.Singleton, metadata);

      // Act
      const retrievedMetadata = container.getMetadata('testService');

      // Assert
      expect(retrievedMetadata).toEqual(metadata);
    });

    it('should create independent scopes', () => {
      // Arrange
      class ScopedService {
        public value = Math.random();
      }
      container.registerScoped('scoped', ScopedService);

      // Act
      const scope1 = container.createScope();
      const scope2 = container.createScope();

      // Assert
      expect(scope1).not.toBe(scope2);
      expect(scope1.isRegistered('scoped')).toBe(true);
      expect(scope2.isRegistered('scoped')).toBe(true);
    });

    it('should dispose container and cleanup resources', async () => {
      // Arrange
      let disposed = false;
      class DisposableService {
        async dispose(): Promise<void> {
          disposed = true;
        }
      }

      const disposableFactory = {
        create: () => new DisposableService(),
        dispose: async (instance: DisposableService) => {
          await instance.dispose();
        }
      };

      container.register('disposable', disposableFactory, ServiceLifetime.Singleton);
      container.resolve('disposable');

      // Act
      await container.dispose();

      // Assert
      expect(disposed).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should throw error when resolving non-existent service', () => {
      // Act & Assert
      expect(() => {
        container.resolve('nonExistent');
      }).toThrow('Service not registered: nonExistent');
    });

    it('should handle factory creation errors', () => {
      // Arrange
      const faultyFactory = () => {
        throw new Error('Factory error');
      };

      container.register('faulty', faultyFactory);

      // Act & Assert
      expect(() => {
        container.resolve('faulty');
      }).toThrow('Factory error');
    });

    it('should handle disposal errors gracefully', async () => {
      // Arrange
      class ErrorService {
        async dispose(): Promise<void> {
          throw new Error('Dispose error');
        }
      }

      const errorFactory = {
        create: () => new ErrorService(),
        dispose: async (instance: ErrorService) => {
          await instance.dispose();
        }
      };

      container.register('errorService', errorFactory);
      container.resolve('errorService');

      // Act & Assert (should not throw)
      await expect(container.dispose()).resolves.not.toThrow();
    });
  });

  describe('Performance Tests', () => {
    it('should handle large number of registrations efficiently', () => {
      // Arrange
      const startTime = performance.now();
      const serviceCount = 1000;

      // Act
      for (let i = 0; i < serviceCount; i++) {
        class DynamicService {
          public id = i;
        }
        container.register(`service${i}`, DynamicService, ServiceLifetime.Singleton);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Assert
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      expect(container.isRegistered('service999')).toBe(true);
    });

    it('should resolve services efficiently', () => {
      // Arrange
      class PerformanceService {
        public value = 'performance-test';
      }

      container.registerSingleton('performance', PerformanceService);

      const iterations = 10000;
      const startTime = performance.now();

      // Act
      for (let i = 0; i < iterations; i++) {
        container.resolve('performance');
      }

      const endTime = performance.now();
      const duration = endTime - startTime;
      const averageTime = duration / iterations;

      // Assert
      expect(averageTime).toBeLessThan(0.1); // Average less than 0.1ms per resolution
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple container instances independently', () => {
      // Arrange
      class TestService {}
      const container1 = new IoCContainer();
      const container2 = new IoCContainer();

      // Act
      container1.register('test', TestService);
      container2.register('test', TestService);

      // Assert
      expect(container1.resolve('test')).not.toBe(container2.resolve('test'));
    });

    it('should handle complex dependency graphs', () => {
      // Arrange
      class ServiceA {
        constructor(public serviceC: ServiceC) {}
      }

      class ServiceB {
        constructor(public serviceA: ServiceA) {}
      }

      class ServiceC {
        public value = 'service-c';
      }

      class RootService {
        constructor(
          public serviceA: ServiceA,
          public serviceB: ServiceB
        ) {}
      }

      container.registerSingleton('serviceC', ServiceC);
      container.registerSingleton('serviceA', ServiceA);
      container.registerSingleton('serviceB', ServiceB);
      container.registerSingleton('root', RootService);

      // Act
      const resolved = container.resolve('root');

      // Assert
      expect(resolved).toBeInstanceOf(RootService);
      expect(resolved.serviceA).toBeInstanceOf(ServiceA);
      expect(resolved.serviceB).toBeInstanceOf(ServiceB);
      expect(resolved.serviceA.serviceC).toBe(resolved.serviceB.serviceA.serviceC);
    });
  });
});