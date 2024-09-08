/// <reference types="vitest" />
/// <reference types="vitest/globals" />

import { isCI } from 'std-env'
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    isolate: true,
    threads: isCI, // kills my computer
    testTimeout: 300000, // 5 minutes
    hookTimeout: 300000, // 5 minutes,
  },
})
