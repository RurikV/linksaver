/**
 * Global TypeScript Declarations for Tests
 */

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidComponent(): R;
      toHaveValidLifecycle(): R;
      toBeProperlyDisposed(): R;
    }
  }

  var testUtils: {
    wait: (ms: number) => Promise<void>;
    createMockFactory: (instance: any) => {
      create: jest.Mock;
      dispose: jest.Mock;
    };
    randomString: (length?: number) => string;
    createMockMetadata: (overrides?: any) => {
      name: string;
      category: string;
      tags: string[];
      configuration: Record<string, any>;
      dependencies: string[];
    };
  };
}

export {};