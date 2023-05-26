/// <reference types="vitest" />
/// <reference types="vitest/globals" />

import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    include: [
      'packages/**/src/**/*.test.ts',
      'test/**/*.test.ts',
    ],
    env: {
      NODE_ENV: 'development',
    },
    globals: true,
    environment: 'jsdom',
    reporters: 'dot',
    isolate: true,
  },
})
