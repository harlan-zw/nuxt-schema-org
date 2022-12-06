/* eslint-disable spaced-comment */
/// <reference types="vitest" />
/// <reference types="vitest/globals" />

import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    env: {
      NODE_ENV: 'development',
    },
    globals: true,
    environment: 'jsdom',
    reporters: 'dot',
    isolate: true,
  },
})
