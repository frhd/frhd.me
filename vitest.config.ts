import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Mirror the `@/*` path alias from tsconfig.json so tests can import
    // application modules the same way the app does.
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    exclude: [...configDefaults.exclude, '**/.worktrees/**'],
  },
})
