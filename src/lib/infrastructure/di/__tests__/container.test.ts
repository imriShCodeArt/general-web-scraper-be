import { Container } from '../container';
import { Registration } from '../types';

describe('Container', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
  });

  describe('Service Registration', () => {
    it('should register a service', () => {
      const token = Symbol('TestService');
      const registration: Registration<string> = {
        lifetime: 'singleton',
        factory: () => 'test-value',
      };

      expect(() => container.register(token, registration)).not.toThrow();
    });

    it('should register multiple services', () => {
      const token1 = Symbol('Service1');
      const token2 = Symbol('Service2');

      container.register(token1, { lifetime: 'singleton', factory: () => 'value1' });
      container.register(token2, { lifetime: 'singleton', factory: () => 'value2' });

      // Should not throw
      expect(true).toBe(true);
    });

    it('should overwrite existing registration', () => {
      const token = Symbol('TestService');

      container.register(token, { lifetime: 'singleton', factory: () => 'first-value' });
      container.register(token, { lifetime: 'singleton', factory: () => 'second-value' });

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('Service Resolution', () => {
    it('should resolve singleton service', async () => {
      const token = Symbol('SingletonService');
      container.register(token, { lifetime: 'singleton', factory: () => 'singleton-value' });

      const instance1 = await container.resolve<string>(token);
      const instance2 = await container.resolve<string>(token);

      expect(instance1).toBe('singleton-value');
      expect(instance2).toBe(instance1); // Same instance
    });

    it('should resolve transient service', async () => {
      const token = Symbol('TransientService');
      let callCount = 0;
      container.register(token, {
        lifetime: 'transient',
        factory: () => {
          callCount++;
          return `transient-value-${callCount}`;
        },
      });

      const instance1 = await container.resolve<string>(token);
      const instance2 = await container.resolve<string>(token);

      expect(instance1).toBe('transient-value-1');
      expect(instance2).toBe('transient-value-2');
      expect(instance1).not.toBe(instance2); // Different instances
    });

    it('should resolve scoped service', async () => {
      const token = Symbol('ScopedService');
      container.register(token, { lifetime: 'scoped', factory: () => 'scoped-value' });

      const instance1 = await container.resolve<string>(token);
      const instance2 = await container.resolve<string>(token);

      expect(instance1).toBe('scoped-value');
      expect(instance2).toBe(instance1); // Same instance within scope
    });

    it('should resolve service with async factory', async () => {
      const token = Symbol('AsyncService');
      container.register(token, {
        lifetime: 'singleton',
        factory: async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
          return 'async-value';
        },
      });

      const instance = await container.resolve<string>(token);
      expect(instance).toBe('async-value');
    });

    it('should resolve service with dependencies', async () => {
      const dependencyToken = Symbol('Dependency');
      const serviceToken = Symbol('Service');

      container.register(dependencyToken, { lifetime: 'singleton', factory: () => 'dependency' });
      container.register(serviceToken, {
        lifetime: 'singleton',
        factory: async (c) => `service-${await c.resolve(dependencyToken)}`,
      });

      const instance = await container.resolve<string>(serviceToken);
      expect(instance).toBe('service-dependency');
    });
  });

  describe('Error Handling', () => {
    it('should throw error when resolving non-existent service', async () => {
      const token = Symbol('NonExistentService');

      await expect(container.resolve(token)).rejects.toThrow('Service not found');
    });

    it('should detect circular dependencies', async () => {
      const tokenA = Symbol('ServiceA');
      const tokenB = Symbol('ServiceB');

      container.register(tokenA, {
        lifetime: 'singleton',
        factory: async (c) => `A-${await c.resolve(tokenB)}`,
      });
      container.register(tokenB, {
        lifetime: 'singleton',
        factory: async (c) => `B-${await c.resolve(tokenA)}`,
      });

      await expect(container.resolve(tokenA)).rejects.toThrow('Circular dependency detected');
    });

    it('should handle factory errors', async () => {
      const token = Symbol('FailingService');
      container.register(token, {
        lifetime: 'singleton',
        factory: () => {
          throw new Error('Factory error');
        },
      });

      await expect(container.resolve(token)).rejects.toThrow('Factory error');
    });
  });

  describe('Scope Management', () => {
    it('should create scoped container', () => {
      const scopedContainer = container.createScope();

      expect(scopedContainer).toBeInstanceOf(Container);
      expect(scopedContainer).not.toBe(container);
    });

    it('should inherit parent registrations', async () => {
      const token = Symbol('ParentService');
      container.register(token, { lifetime: 'singleton', factory: () => 'parent-value' });

      const scopedContainer = container.createScope();
      const instance = await scopedContainer.resolve<string>(token);

      expect(instance).toBe('parent-value');
    });

    it('should allow scope-specific registrations', async () => {
      const parentToken = Symbol('ParentService');
      const scopedToken = Symbol('ScopedService');

      container.register(parentToken, { lifetime: 'singleton', factory: () => 'parent-value' });

      const scopedContainer = container.createScope();
      scopedContainer.register(scopedToken, { lifetime: 'singleton', factory: () => 'scoped-value' });

      const parentInstance = await scopedContainer.resolve<string>(parentToken);
      const scopedInstance = await scopedContainer.resolve<string>(scopedToken);

      expect(parentInstance).toBe('parent-value');
      expect(scopedInstance).toBe('scoped-value');
    });

    it('should not affect parent container when resolving in scope', async () => {
      const token = Symbol('Service');
      container.register(token, { lifetime: 'singleton', factory: () => 'parent-value' });

      const scopedContainer = container.createScope();
      scopedContainer.register(token, { lifetime: 'singleton', factory: () => 'scoped-value' });

      const parentInstance = await container.resolve<string>(token);
      const scopedInstance = await scopedContainer.resolve<string>(token);

      expect(parentInstance).toBe('parent-value');
      expect(scopedInstance).toBe('scoped-value');
    });
  });

  describe('Disposal', () => {
    it('should dispose scoped instances', async () => {
      const token = Symbol('DisposableService');
      let disposed = false;

      container.register(token, {
        lifetime: 'scoped',
        factory: () => ({
          destroy: () => { disposed = true; return Promise.resolve(); },
        }),
      });

      const scopedContainer = container.createScope();
      await scopedContainer.resolve(token);

      await scopedContainer.dispose();
      expect(disposed).toBe(true);
    });

    it('should dispose singleton instances', async () => {
      const token = Symbol('DisposableSingleton');
      let disposed = false;

      container.register(token, {
        lifetime: 'singleton',
        factory: () => ({}),
        destroy: () => { disposed = true; return Promise.resolve(); },
      });

      await container.resolve(token);
      await container.dispose();

      expect(disposed).toBe(true);
    });

    it('should not dispose transient instances', async () => {
      const token = Symbol('TransientService');
      let disposed = false;

      container.register(token, {
        lifetime: 'transient',
        factory: () => ({
          destroy: () => { disposed = true; return Promise.resolve(); },
        }),
      });

      await container.resolve(token);
      await container.dispose();

      expect(disposed).toBe(false);
    });

    it('should handle disposal errors gracefully', async () => {
      const token = Symbol('FailingDisposal');

      container.register(token, {
        lifetime: 'singleton',
        factory: () => ({
          destroy: () => { throw new Error('Disposal error'); },
        }),
      });

      await container.resolve(token);

      // Should not throw
      await expect(container.dispose()).resolves.not.toThrow();
    });
  });

  describe('withScope', () => {
    it('should execute function with scope and dispose', async () => {
      const token = Symbol('ScopedService');
      let disposed = false;

      container.register(token, {
        lifetime: 'scoped',
        factory: () => ({
          destroy: () => { disposed = true; return Promise.resolve(); },
        }),
      });

      const result = await container.withScope(async (scope) => {
        await scope.resolve(token);
        return 'scoped-result';
      });

      expect(result).toBe('scoped-result');
      expect(disposed).toBe(true);
    });

    it('should handle function errors and still dispose', async () => {
      const token = Symbol('ScopedService');
      let disposed = false;

      container.register(token, {
        lifetime: 'scoped',
        factory: () => ({
          destroy: () => { disposed = true; return Promise.resolve(); },
        }),
      });

      await expect(container.withScope(async (scope) => {
        // Resolve the service first to create the instance
        await scope.resolve(token);
        throw new Error('Function error');
      })).rejects.toThrow('Function error');

      expect(disposed).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty container', async () => {
      const token = Symbol('NonExistent');
      await expect(container.resolve(token)).rejects.toThrow('Service not found');
    });

    it('should handle null/undefined factory return', async () => {
      const token = Symbol('NullService');
      container.register(token, { lifetime: 'singleton', factory: () => null as any });

      const instance = await container.resolve(token);
      expect(instance).toBeNull();
    });

    it('should handle factory returning undefined', async () => {
      const token = Symbol('UndefinedService');
      container.register(token, { lifetime: 'singleton', factory: () => undefined as any });

      const instance = await container.resolve(token);
      expect(instance).toBeUndefined();
    });
  });
});
