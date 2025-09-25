// Validation services registry
import { Container } from '../container';

/**
 * Registers validation services
 * Currently no validation services are registered, but this structure
 * allows for future validation service registrations
 */
export function registerValidationServices(_container: Container): void {
  // Future validation services can be registered here
  // For example:
  // container.register(TOKENS.ValidationService, {
  //   lifetime: 'singleton',
  //   factory: () => new ValidationService(),
  // });
}
