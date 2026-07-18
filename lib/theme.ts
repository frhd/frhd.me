/**
 * Theme plumbing shared by the no-flash inline script (see app/layout.tsx)
 * and the manual toggle (app/components/home/ThemeToggle.tsx).
 *
 * The decision rule lives in exactly one shipped place: the script string
 * built by `buildThemeScript`. A stored manual choice wins; otherwise the OS
 * `prefers-color-scheme` decides. The tests eval the emitted script under a
 * mocked DOM, so what is verified is literally what runs in <head>.
 */

export type Theme = 'light' | 'dark'

/** localStorage key holding the user's manual light/dark choice, if any. */
export const THEME_STORAGE_KEY = 'frhd-theme'

/**
 * Source of the inline no-flash script. It must run before first paint, so
 * app/layout.tsx injects it into <head> via dangerouslySetInnerHTML
 * (next/script would run too late). The try/catch keeps a broken or blocked
 * localStorage from taking the page down; the CSS `prefers-color-scheme`
 * fallback in globals.css then still applies.
 */
export function buildThemeScript(): string {
  return (
    '(function(){try{' +
    `var s=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});` +
    'var d=window.matchMedia("(prefers-color-scheme: dark)").matches;' +
    'var t=(s==="light"||s==="dark")?s:(d?"dark":"light");' +
    'document.documentElement.setAttribute("data-theme",t);' +
    '}catch(e){}})();'
  )
}
