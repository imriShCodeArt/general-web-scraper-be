import type { Registration } from './types';

export class Container {
  private registrations = new Map<symbol, Registration<unknown>>();
  private resolving = new Set<symbol>();
  private scopedInstances = new Map<symbol, unknown>();
  private parent?: Container;

  constructor(parent?: Container) {
    this.parent = parent;
  }

  register<T>(token: symbol, registration: Registration<T>): void {
    this.registrations.set(token, registration as Registration<unknown>);
  }

  async resolve<T>(token: symbol): Promise<T> {
    const registration = this.getRegistration(token);
    if (!registration) {
      throw new Error(`Service not found for token ${String(token)}`);
    }

    if (this.resolving.has(token)) {
      throw new Error(`Circular dependency detected while resolving ${String(token)}`);
    }

    this.resolving.add(token);
    try {
      if (registration.lifetime === 'singleton') {
        if (registration.instance === undefined) {
          registration.instance = await registration.factory(this);
        }
        return registration.instance as T;
      }

      if (registration.lifetime === 'scoped') {
        if (!this.scopedInstances.has(token)) {
          const instance = await registration.factory(this);
          this.scopedInstances.set(token, instance);
        }
        return this.scopedInstances.get(token) as T;
      }

      // transient
      return (await registration.factory(this)) as T;
    } finally {
      this.resolving.delete(token);
    }
  }

  async dispose(): Promise<void> {
    const disposals: Array<Promise<void> | void> = [];

    // dispose scoped instances
    for (const instance of this.scopedInstances.values()) {
      // Note: We can't easily get the registration here without the token
      // This is a limitation of the current design
      // For now, we'll just dispose the instance if it has a destroy method
      if (instance && typeof (instance as unknown as { destroy?: () => Promise<void> }).destroy === 'function') {
        disposals.push((instance as unknown as { destroy: () => Promise<void> }).destroy());
      }
    }
    this.scopedInstances.clear();

    // dispose singleton instances only if owned by this container
    for (const registration of this.registrations.values()) {
      if (registration.lifetime === 'singleton' && registration.instance !== undefined) {
        if (registration.destroy) {
          disposals.push(registration.destroy(registration.instance));
        }
      }
    }

    await Promise.all(disposals);
  }

  createScope(): Container {
    return new Container(this);
  }

  async withScope<T>(fn: (scope: Container) => Promise<T> | T): Promise<T> {
    const scope = this.createScope();
    try {
      return await fn(scope);
    } finally {
      await scope.dispose();
    }
  }

  private getRegistration(token: symbol): Registration<unknown> | undefined {
    return this.getOwnRegistration(token) ?? this.parent?.getRegistration(token);
  }

  private getOwnRegistration(token: symbol): Registration<unknown> | undefined {
    return this.registrations.get(token);
  }
}


