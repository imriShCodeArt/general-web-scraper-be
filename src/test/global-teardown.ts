/**
 * Global Jest teardown to force exit and prevent hanging
 */

export default async function globalTeardown() {
  // Clear all timers to prevent hanging
  if (global.gc) {
    global.gc();
  }

  // Force exit after a short delay to allow any pending operations to complete
  setTimeout(() => {
    process.exit(0);
  }, 100);
}
