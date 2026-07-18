/**
 * Controllable matchMedia mock for jsdom (which does not implement it).
 *
 * Installed globally by test/setup.ts. Tests drive the mocked OS
 * color-scheme preference with `setPrefersDark`, which also dispatches a
 * `change` event to any registered listeners — enough to exercise code that
 * subscribes to `(prefers-color-scheme: dark)`, like ThemeToggle and the
 * inline no-flash theme script.
 */

type ChangeListener = (event: MediaQueryListEvent) => void

const DARK_QUERY = '(prefers-color-scheme: dark)'

let prefersDark = false
const listeners = new Set<ChangeListener>()

export function installMatchMediaMock(): void {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      get matches() {
        return query === DARK_QUERY ? prefersDark : false
      },
      media: query,
      onchange: null,
      addEventListener: (type: string, listener: ChangeListener) => {
        if (type === 'change') listeners.add(listener)
      },
      removeEventListener: (type: string, listener: ChangeListener) => {
        if (type === 'change') listeners.delete(listener)
      },
      addListener: (listener: ChangeListener) => listeners.add(listener),
      removeListener: (listener: ChangeListener) => listeners.delete(listener),
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList
}

/** Set the mocked OS preference and notify registered `change` listeners. */
export function setPrefersDark(next: boolean): void {
  prefersDark = next
  const event = { matches: next, media: DARK_QUERY } as MediaQueryListEvent
  for (const listener of listeners) listener(event)
}

/** Reset preference and drop all listeners; runs before each test. */
export function resetMatchMediaMock(): void {
  prefersDark = false
  listeners.clear()
}
