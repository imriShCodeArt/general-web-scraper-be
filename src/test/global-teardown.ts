/**
 * Global Jest teardown to force exit and prevent hanging
 */

export default async function globalTeardown() {
  // Force exit after a short delay to allow any pending operations to complete
  setTimeout(() => {
    process.exit(0);
  }, 100);
}
