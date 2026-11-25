import { builder } from '@nuxt/module-builder/tsdown'
import { defineConfig } from 'tsdown'

export default defineConfig({
  deps: {
    alwaysBundle: [/^@unhead\/schema-org$/],
  },
  plugins: [
    builder({
      entries: [
        './src/schema',
        './src/content',
        './src/content-valibot',
      ],
      externals: [
        'nuxt/server',
        'h3',
        'std-env',
        'nitropack',
        'consola',
        '@harlan-zw/comark-content',
        '@nuxt/content',
        'valibot',
        'zod',
        '@unhead/vue',
        '@unhead/schema',
        '@unhead/schema-org/vue',
        '@unhead/vue/types',
      ],
    }),
  ],
})
