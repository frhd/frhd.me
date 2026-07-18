import '@testing-library/jest-dom'
import { vi } from 'vitest'

// jsdom does not implement matchMedia; provide a minimal stub so components
// that read the OS color-scheme preference (e.g. ThemeToggle) can mount.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList
}

// Mock the qrcode library for tests
vi.mock('qrcode', () => ({
  default: {
    toString: vi.fn().mockImplementation((url: string) => {
      return Promise.resolve(`█▀▀▀▀▀█ MOCK QR █▀▀▀▀▀█\n█ URL: ${url} █`)
    }),
  },
  toString: vi.fn().mockImplementation((url: string) => {
    return Promise.resolve(`█▀▀▀▀▀█ MOCK QR █▀▀▀▀▀█\n█ URL: ${url} █`)
  }),
}))
