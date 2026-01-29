import createDebug from 'debug';

// Create namespaced debuggers
export const debug = {
  api: createDebug('sprout-track:api'),
  auth: createDebug('sprout-track:auth'),
  config: createDebug('sprout-track:config'),
  cmd: createDebug('sprout-track:cmd'),
};

// Enable all sprout-track debug output when --verbose is used
export function enableVerbose(): void {
  createDebug.enable('sprout-track:*');
}

// Check if debug is enabled
export function isDebugEnabled(): boolean {
  return createDebug.enabled('sprout-track:api');
}
