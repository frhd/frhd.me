import '@testing-library/jest-dom'
import { beforeEach, vi } from 'vitest'

import { installMatchMediaMock, resetMatchMediaMock } from './match-media-mock'

// jsdom does not implement matchMedia; install a controllable mock so tests
// can both mount components that read the OS color-scheme preference and
// drive preference changes (see test/match-media-mock.ts).
if (typeof window !== 'undefined') {
  installMatchMediaMock()
  beforeEach(() => {
    resetMatchMediaMock()
  })
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
