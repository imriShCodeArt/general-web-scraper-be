import { Container } from '../di/container';
import { TOKENS } from '../di/tokens';

describe('Container', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
  });

  afterEach(async () => {
    await container.dispose();
  });

  describe('Service Registration', () => {
    it('should register and resolve a service', async () => {
      const mockService = { name: 'test', method: () => 'test' };
      container.register(TOKENS.Logger, {
        lifetime: 'transient',
        factory: () => mockService,
      });

      const resolved = await container.resolve(TOKENS.Logger);
      expect(resolved).toBe(mockService);
    });

    it('should throw error when resolving non-existent service', async () => {
      await expect(container.resolve(TOKENS.Logger)).rejects.toThrow('Service not found for token Symbol(Logger)');
    });
  });

  describe('Lifetime Management', () => {
    it('should create singleton instances', async () => {
      let callCount = 0;
      const factory = () => {
        callCount++;
        return { id: callCount };
      };

      container.register(TOKENS.Logger, {
        lifetime: 'singleton',
        factory,
      });

      const first = await container.resolve(TOKENS.Logger) as { id: number };
      const second = await container.resolve(TOKENS.Logger) as { id: number };

      expect(first).toBe(second);
      expect(callCount).toBe(1);
    });

    it('should create scoped instances', async () => {
      let callCount = 0;
      const factory = () => {
        callCount++;
        return { id: callCount };
      };

      container.register(TOKENS.Logger, {
        lifetime: 'scoped',
        factory,
      });

      const first = await container.resolve(TOKENS.Logger) as { id: number };
      const second = await container.resolve(TOKENS.Logger) as { id: number };

      expect(first).toBe(second);
      expect(callCount).toBe(1);
    });

    it('should create transient instances', async () => {
      let callCount = 0;
      const factory = () => {
        callCount++;
        return { id: callCount };
      };

      container.register(TOKENS.Logger, {
        lifetime: 'transient',
        factory,
      });

      const first = await container.resolve(TOKENS.Logger) as { id: number };
      const second = await container.resolve(TOKENS.Logger) as { id: number };

      expect(first.id).toBe(1);
      expect(second.id).toBe(2);
      expect(callCount).toBe(2);
    });
  });

  describe('Scope Management', () => {
    it('should create scoped containers', () => {
      const scope = container.createScope();
      expect(scope).toBeInstanceOf(Container);
    });

    it('should inherit parent registrations', async () => {
      const mockService = { name: 'test' };
      container.register(TOKENS.Logger, {
        lifetime: 'singleton',
        factory: () => mockService,
      });

      const scope = container.createScope();
      const resolved = await scope.resolve(TOKENS.Logger);
      expect(resolved).toBe(mockService);
    });

    it('should allow scope-specific registrations', async () => {
      const scope = container.createScope();
      const scopeService = { name: 'scope' };

      scope.register(TOKENS.Logger, {
        lifetime: 'transient',
        factory: () => scopeService,
      });

      const resolved = await scope.resolve(TOKENS.Logger);
      expect(resolved).toBe(scopeService);
    });
  });

  describe('Disposal', () => {
    it('should dispose scoped instances', async () => {
      const mockDestroy = jest.fn();
      const mockService = { destroy: mockDestroy };

      container.register(TOKENS.Logger, {
        lifetime: 'scoped',
        factory: () => mockService,
      });

      await container.resolve(TOKENS.Logger);
      await container.dispose();

      expect(mockDestroy).toHaveBeenCalled();
    });

    it('should dispose singleton instances', async () => {
      const mockDestroy = jest.fn();
      const mockService = { destroy: mockDestroy };

      container.register(TOKENS.Logger, {
        lifetime: 'singleton',
        factory: () => mockService,
        destroy: mockDestroy,
      });

      await container.resolve(TOKENS.Logger);
      await container.dispose();

      expect(mockDestroy).toHaveBeenCalledWith(mockService);
    });
  });

  describe('Circular Dependency Detection', () => {
    it('should detect circular dependencies', async () => {
      container.register(TOKENS.Logger, {
        lifetime: 'transient',
        factory: async (c) => {
          // This creates a circular dependency
          return await c.resolve(TOKENS.Logger);
        },
      });

      await expect(container.resolve(TOKENS.Logger)).rejects.toThrow('Circular dependency detected');
    });
  });

  describe('withScope', () => {
    it('should execute function with scope and dispose', async () => {
      let scopeDisposed = false;

      // Mock the createScope method to track when dispose is called
      const originalCreateScope = container.createScope.bind(container);
      container.createScope = () => {
        const scope = originalCreateScope();
        const originalDispose = scope.dispose.bind(scope);
        scope.dispose = async () => {
          scopeDisposed = true;
          return originalDispose();
        };
        return scope;
      };

      const result = await container.withScope(async (s) => {
        expect(s).toBeInstanceOf(Container);
        return 'test result';
      });

      expect(result).toBe('test result');
      expect(scopeDisposed).toBe(true);
    });
  });
});
