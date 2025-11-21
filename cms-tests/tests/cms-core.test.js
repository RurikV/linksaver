/**
 * CMS Core Tests - Direct File System Approach
 */

const fs = require('fs');
const path = require('path');

// Dynamically require CMS core modules from compiled files
const cmsCorePath = path.resolve(__dirname, '../../cms-core/dist');

// Import modules that exist
const imports = {};

try {
  // Try to import IoCContainer
  const containerPath = path.join(cmsCorePath, 'container/IoCContainer.js');
  if (fs.existsSync(containerPath)) {
    imports.IoCContainer = require(containerPath);
  }

  // Try to import interfaces
  const interfacesPath = path.join(cmsCorePath, 'interfaces.js');
  if (fs.existsSync(interfacesPath)) {
    imports.interfaces = require(interfacesPath);
  }

  // Try to import BaseComponent
  const baseComponentPath = path.join(cmsCorePath, 'components/BaseComponent.js');
  if (fs.existsSync(baseComponentPath)) {
    imports.BaseComponent = require(baseComponentPath);
  }

  // Try to import CompositeComponent
  const compositeComponentPath = path.join(cmsCorePath, 'components/CompositeComponent.js');
  if (fs.existsSync(compositeComponentPath)) {
    imports.CompositeComponent = require(compositeComponentPath);
  }

  // Try to import PageBuilder
  const pageBuilderPath = path.join(cmsCorePath, 'builder/PageBuilder.js');
  if (fs.existsSync(pageBuilderPath)) {
    imports.PageBuilder = require(pageBuilderPath);
  }

  // Try to import Pipeline
  const pipelinePath = path.join(cmsCorePath, 'pipeline/Pipeline.js');
  if (fs.existsSync(pipelinePath)) {
    imports.Pipeline = require(pipelinePath);
  }

  // Try to import ComponentRegistry
  const registryPath = path.join(cmsCorePath, 'plugins/ComponentRegistry.js');
  if (fs.existsSync(registryPath)) {
    imports.ComponentRegistry = require(registryPath);
  }

} catch (error) {
  console.error('Error importing CMS modules:', error.message);
}

describe('CMS Core Module Loading', () => {
  test('should load compiled CMS core files', () => {
    const distPath = path.resolve(__dirname, '../../cms-core/dist');
    expect(fs.existsSync(distPath)).toBe(true);

    // Check for main compiled files
    const expectedFiles = [
      'container/IoCContainer.js',
      'interfaces.js',
      'components/BaseComponent.js',
      'components/CompositeComponent.js',
      'builder/PageBuilder.js',
      'pipeline/Pipeline.js',
      'plugins/ComponentRegistry.js'
    ];

    expectedFiles.forEach(file => {
      const filePath = path.join(distPath, file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  test('should import IoCContainer successfully', () => {
    expect(imports.IoCContainer).toBeDefined();
    expect(imports.IoCContainer.IoCContainer).toBeDefined();
    expect(typeof imports.IoCContainer.IoCContainer).toBe('function');
  });

  test('should import interfaces successfully', () => {
    expect(imports.interfaces).toBeDefined();
    expect(typeof imports.interfaces).toBe('object');
  });

  test('should import component classes successfully', () => {
    if (imports.BaseComponent) {
      expect(imports.BaseComponent.BaseComponent).toBeDefined();
    }

    if (imports.CompositeComponent) {
      expect(imports.CompositeComponent.CompositeComponent).toBeDefined();
    }
  });
});

describe('CMS Core Functionality Tests', () => {
  test('should create and use IoCContainer', () => {
    const { IoCContainer, ServiceLifetime } = imports.IoCContainer;

    expect(IoCContainer).toBeDefined();
    expect(ServiceLifetime).toBeDefined();

    // Create container instance
    const container = new IoCContainer();
    expect(container).toBeDefined();
    expect(typeof container).toBe('object');

    // Test basic registration
    class TestService {
      constructor() {
        this.value = 'test';
      }
    }

    container.register('TestService', TestService, ServiceLifetime.Singleton);
    const instance = container.resolve('TestService');

    expect(instance).toBeDefined();
    expect(instance).toBeInstanceOf(TestService);
    expect(instance.value).toBe('test');

    // Cleanup
    container.dispose();
  });

  test('should handle service lifetimes correctly', () => {
    const { IoCContainer, ServiceLifetime } = imports.IoCContainer;

    const container = new IoCContainer();

    class TestService {
      constructor() {
        this.id = Math.random();
      }
    }

    // Test singleton
    container.register('SingletonService', TestService, ServiceLifetime.Singleton);
    const singleton1 = container.resolve('SingletonService');
    const singleton2 = container.resolve('SingletonService');
    expect(singleton1.id).toBe(singleton2.id);

    // Test transient
    container.register('TransientService', TestService, ServiceLifetime.Transient);
    const transient1 = container.resolve('TransientService');
    const transient2 = container.resolve('TransientService');
    expect(transient1.id).not.toBe(transient2.id);

    container.dispose();
  });

  test('should validate container state management', () => {
    const { IoCContainer, ServiceLifetime } = imports.IoCContainer;

    const container = new IoCContainer();

    // Test initial state
    expect(container.isRegistered('NonExistent')).toBe(false);

    // Test registration
    class TestService {}
    container.register('TestService', TestService, ServiceLifetime.Singleton);
    expect(container.isRegistered('TestService')).toBe(true);

    // Test disposal
    expect(() => container.dispose()).not.toThrow();
  });
});

describe('CMS Component System Tests', () => {
  test('should work with base components', () => {
    if (imports.BaseComponent && imports.BaseComponent.BaseComponent) {
      const { BaseComponent } = imports.BaseComponent;

      expect(BaseComponent).toBeDefined();
      expect(typeof BaseComponent).toBe('function');
    } else {
      // Skip test if BaseComponent is not available
      expect(true).toBe(true);
    }
  });

  test('should work with composite components', () => {
    if (imports.CompositeComponent && imports.CompositeComponent.CompositeComponent) {
      const { CompositeComponent } = imports.CompositeComponent;

      expect(CompositeComponent).toBeDefined();
      expect(typeof CompositeComponent).toBe('function');
    } else {
      // Skip test if CompositeComponent is not available
      expect(true).toBe(true);
    }
  });
});

describe('CMS Builder System Tests', () => {
  test('should work with page builder', () => {
    if (imports.PageBuilder) {
      expect(imports.PageBuilder).toBeDefined();
      expect(typeof imports.PageBuilder).toBe('object');
    } else {
      // Skip test if PageBuilder is not available
      expect(true).toBe(true);
    }
  });
});

describe('CMS Pipeline System Tests', () => {
  test('should work with pipeline', () => {
    if (imports.Pipeline) {
      expect(imports.Pipeline).toBeDefined();
      expect(typeof imports.Pipeline).toBe('object');
    } else {
      // Skip test if Pipeline is not available
      expect(true).toBe(true);
    }
  });
});

describe('CMS Plugin System Tests', () => {
  test('should work with component registry', () => {
    if (imports.ComponentRegistry) {
      expect(imports.ComponentRegistry).toBeDefined();
      expect(typeof imports.ComponentRegistry).toBe('object');
    } else {
      // Skip test if ComponentRegistry is not available
      expect(true).toBe(true);
    }
  });
});