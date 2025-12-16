import '@testing-library/jest-dom'
import { vi } from 'vitest'

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
