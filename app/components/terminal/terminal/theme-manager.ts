/**
 * Theme Manager for Terminal
 * Handles theme loading, storage, and dynamic theme changes
 */

import { getStoredTheme, getTheme, getDefaultTheme } from "../xterm-themes";

/**
 * Initialize terminal theme from stored preference
 * @returns Theme colors object for xterm configuration
 */
export function initializeTheme(): { colors: Record<string, string> } {
  const storedThemeName = getStoredTheme();
  const storedTheme = getTheme(storedThemeName) || getDefaultTheme();
  return storedTheme;
}

/**
 * Apply a new theme to the terminal
 * @param themeName - Name of the theme to apply
 * @param terminalOptions - Terminal options object to update
 */
export function applyTheme(
  themeName: string,
  terminalOptions: { theme?: Record<string, string> }
): void {
  const newTheme = getTheme(themeName);
  if (newTheme && terminalOptions) {
    terminalOptions.theme = newTheme.colors;
  }
}

/**
 * Create theme change event handler
 * @param terminalOptions - Terminal options object to update
 * @returns Event handler function
 */
export function createThemeChangeHandler(
  terminalOptions: { theme?: Record<string, string> }
): (event: CustomEvent) => void {
  return (event: CustomEvent) => {
    const themeName = event.detail.theme;
    applyTheme(themeName, terminalOptions);
  };
}

/**
 * Dispatch theme change event
 * @param themeName - Name of the theme to broadcast
 */
export function dispatchThemeChange(themeName: string): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("terminal-theme-change", {
        detail: { theme: themeName },
      })
    );
  }
}

// Re-export theme utilities for convenience
export { getStoredTheme, getTheme, getDefaultTheme } from "../xterm-themes";
