import { defineConfig } from 'vitest/config'

// self-contained config so vitest does not walk up to the root workspace config
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['./*.test.ts'],
    exclude: ['**/node_modules/**'],
  },
})
