/// <reference types="vitest" />
/// <reference types="vitest/globals" />
import { defineVitestConfig } from '@nuxt/test-utils/config'
import { isCI } from 'std-env'

export default defineVitestConfig({
  test: {
    isolate: true,
    threads: isCI, // kills my computer
    testTimeout: 300000, // 5 minutes
    hookTimeout: 300000, // 5 minutes,
  },
})
