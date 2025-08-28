import { DIContainer, Service } from '../types';

/**
 * Simple Dependency Injection Container
 * Provides service registration, resolution, and lifecycle management
 */
export class Container implements DIContainer {
  private services = new Map<string, any>();
  private singletons = new Map<string, any>();
  private factories = new Map<string, () => any>();
  private lifecycleHooks = new Map<string, { initialize?: () => Promise<void>; destroy?: () => Promise<void> }>();

  /**
   * Register a service implementation
   */
  register<T>(token: string, implementation: T): void {
    this.services.set(token, implementation);

    // If it's a service with lifecycle hooks, store them
    if (implementation && typeof implementation === 'object' && 'name' in implementation) {
      const service = implementation as Service;
      this.lifecycleHooks.set(token, {
        initialize: service.initialize?.bind(service),
        destroy: service.destroy?.bind(service),
      });
    }
  }

  /**
   * Register a singleton service
   */
  registerSingleton<T>(token: string, factory: () => T): void {
    this.factories.set(token, factory);
  }

  /**
   * Register a factory function
   */
  registerFactory<T>(token: string, factory: () => T): void {
    this.factories.set(token, factory);
  }

  /**
   * Resolve a service
   */
  resolve<T>(token: string): T {
    // Check if we have a singleton instance
    if (this.singletons.has(token)) {
      return this.singletons.get(token);
    }

    // Check if we have a factory
    if (this.factories.has(token)) {
      const factory = this.factories.get(token);
      if (factory) {
        const instance = factory();

        // If it's a singleton factory, store the instance
        if (token.startsWith('singleton:')) {
          this.singletons.set(token, instance);
        }

        return instance;
      }
    }

    // Check if we have a direct implementation
    if (this.services.has(token)) {
      return this.services.get(token);
    }

    throw new Error(`Service not found: ${token}`);
  }

  /**
   * Check if a service exists
   */
  has(token: string): boolean {
    return this.services.has(token) || this.factories.has(token) || this.singletons.has(token);
  }

  /**
   * Initialize all services that have initialize hooks
   */
  async initialize(): Promise<void> {
    const initPromises: Promise<void>[] = [];

    for (const [token, hooks] of this.lifecycleHooks) {
      if (hooks.initialize) {
        try {
          const service = this.resolve(token);
          initPromises.push(hooks.initialize.call(service));
        } catch (error) {
          console.warn(`Failed to initialize service ${token}:`, error);
        }
      }
    }

    await Promise.all(initPromises);
  }

  /**
   * Destroy all services that have destroy hooks
   */
  async destroy(): Promise<void> {
    const destroyPromises: Promise<void>[] = [];

    for (const [token, hooks] of this.lifecycleHooks) {
      if (hooks.destroy) {
        try {
          const service = this.resolve(token);
          destroyPromises.push(hooks.destroy.call(service));
        } catch (error) {
          console.warn(`Failed to destroy service ${token}:`, error);
        }
      }
    }

    await Promise.all(destroyPromises);
  }

  /**
   * Clear all services
   */
  clear(): void {
    this.services.clear();
    this.singletons.clear();
    this.factories.clear();
    this.lifecycleHooks.clear();
  }

  /**
   * Get all registered service tokens
   */
  getRegisteredServices(): string[] {
    return [
      ...Array.from(this.services.keys()),
      ...Array.from(this.factories.keys()),
      ...Array.from(this.singletons.keys()),
    ];
  }

  /**
   * Create a child container
   */
  createChild(): Container {
    const child = new Container();

    // Copy services to child
    for (const [token, service] of this.services) {
      child.register(token, service);
    }

    return child;
  }
}

/**
 * Global container instance
 */
export const container = new Container();

/**
 * Service decorator for automatic registration
 */
export function Injectable(token?: string) {
  return function (target: any) {
    const serviceToken = token || target.name;
    container.register(serviceToken, new target());
  };
}

/**
 * Inject decorator for property injection
 */
export function Inject(token: string) {
  return function (target: any, propertyKey: string) {
    Object.defineProperty(target, propertyKey, {
      get() {
        return container.resolve(token);
      },
      enumerable: true,
      configurable: true,
    });
  };
}
