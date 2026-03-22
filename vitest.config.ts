import { defineVitestProject } from '@nuxt/test-utils/config'
import { defineConfig, defineProject } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    reporters: 'dot',
    projects: [
      // utils folders as *.test.ts in either test/unit or in src/**/*.test.ts
      defineProject({
        test: {
          name: 'unit',
          environment: 'node',
          include: [
            './test/unit/**/*.test.ts',
            './src/**/*.test.ts',
          ],
          exclude: [
            '**/node_modules/**',
          ],
        },
      }),
      // e2e tests in test/integration
      defineProject({
        test: {
          name: 'e2e',
          environment: 'node',
          include: [
            './test/integration/**/*.test.ts',
          ],
          exclude: [
            '**/node_modules/**',
          ],
        },
        plugins: [
          // https://github.com/nuxt/test-utils/issues/1490
          {
            name: 'ignore-bun-test',
            enforce: 'pre',
            resolveId(id) {
              if (id === 'bun:test') {
                return { id: 'bun:test', external: true }
              }
            },
          },
        ],
      }),
    ],
  },
})
