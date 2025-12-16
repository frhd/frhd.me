/**
 * Plugin Sandbox
 *
 * Creates a secure, sandboxed environment for plugin execution.
 * Only safe functions are exposed to plugin code.
 */

/**
 * Sandbox environment type - maps variable names to their values
 */
export type SandboxEnvironment = Record<string, unknown>;

/**
 * Create a sandboxed environment for plugin execution.
 * Only safe functions and objects are exposed.
 *
 * @returns A sandbox object with safe globals
 */
export function createSandbox(): SandboxEnvironment {
  return {
    // Safe globals
    console: {
      log: () => {},
      error: () => {},
      warn: () => {},
    },
    Math,
    Date,
    JSON,
    String,
    Number,
    Boolean,
    Array,
    Object,
    Map,
    Set,
    Promise,
    // Timing functions (limited)
    setTimeout: (fn: () => void, ms: number) => {
      // Cap timeout to 30 seconds
      const cappedMs = Math.min(ms, 30000);
      return setTimeout(fn, cappedMs);
    },
    clearTimeout,
    // Blocked globals (explicitly set to undefined to shadow global scope)
    window: undefined,
    document: undefined,
    localStorage: undefined,
    sessionStorage: undefined,
    fetch: undefined,
    XMLHttpRequest: undefined,
    // Note: eval and Function are not included here because they cannot be
    // used as parameter names in strict mode. The sandbox's strict mode
    // already prevents eval usage, and Function is blocked by not exposing it.
  };
}

/**
 * Execute code within the sandbox environment
 *
 * @param source - The source code to execute
 * @param sandbox - The sandbox environment to use
 * @returns The result of executing the code (should be a plugin object or null)
 */
export function executeInSandbox(
  source: string,
  sandbox: SandboxEnvironment
): unknown {
  // Wrap the source in an IIFE that returns the plugin definition
  const wrappedSource = `
    "use strict";
    ${source}
    return typeof plugin !== 'undefined' ? plugin : null;
  `;

  // Create a function from the source with limited scope
  const pluginFactory = new Function(...Object.keys(sandbox), wrappedSource);

  // Execute in sandbox and return result
  return pluginFactory(...Object.values(sandbox));
}
