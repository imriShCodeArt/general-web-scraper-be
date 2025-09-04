// @ts-nocheck
export type Lifetime = 'singleton' | 'transient' | 'scoped';

export interface Destroyable {
  destroy?: () => Promise<void> | void;
}

export interface Initializable {
  initialize?: () => Promise<void> | void;
}

export type Factory<T> = (container: import('./container').Container) => T | Promise<T>;

export interface Registration<T = unknown> {
  factory: Factory<T>;
  lifetime: Lifetime;
  instance?: T;
  destroy?: (instance: T) => Promise<void> | void;
}

export interface DIContainerLike {
  register<T>(token: symbol, registration: Registration<T>): void;
  resolve<T>(token: symbol): Promise<T>;
  dispose(): Promise<void>;
  createScope(): import('./container').Container;
}


