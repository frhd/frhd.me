/**
 * Theme selection shared by the no-flash inline script (see app/layout.tsx),
 * the manual toggle, and the CSS token system in globals.css.
 *
 * A manual choice persisted to localStorage always wins; otherwise the OS
 * `prefers-color-scheme` decides. Keeping the decision here as one pure
 * function lets it be unit-tested without touching the DOM.
 */

export type Theme = 'light' | 'dark'

/** localStorage key holding the user's manual light/dark choice, if any. */
export const THEME_STORAGE_KEY = 'frhd-theme'

/** True when `value` is a valid persisted theme. */
export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark'
}

/**
 * Resolve the effective theme. A stored manual choice wins over the system
 * preference; anything else (unset or garbage) falls back to the system,
 * where `prefersDark` is the value of `prefers-color-scheme: dark`.
 */
export function resolveTheme(stored: string | null, prefersDark: boolean): Theme {
  if (isTheme(stored)) return stored
  return prefersDark ? 'dark' : 'light'
}
