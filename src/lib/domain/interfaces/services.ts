/**
 * Service Interfaces
 *
 * This file contains all service-related interfaces.
 * It defines the contracts for different types of services.
 */

// Dependency Injection Container Interface
export interface DIContainer {
  register<T>(token: string, implementation: T): void;
  resolve<T>(token: string): T;
  has(token: string): boolean;
  clear(): void;
}

// Service Interface for DI
export interface Service {
  readonly name: string;
  initialize?(): Promise<void>;
  destroy?(): Promise<void>;
}
