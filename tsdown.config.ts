import { builder } from '@nuxt/module-builder/tsdown'
import { defineConfig } from 'tsdown'

const schemaOrg = /^@unhead\/schema-org$/

export default defineConfig({
  deps: {
    alwaysBundle: [schemaOrg],
  },
  plugins: [
    {
      name: 'schema-org:vendor-declarations',
      resolveId: {
        order: 'pre',
        filter: { id: schemaOrg },
        handler(_id, importer) {
          if (importer && /\.d\.[cm]?ts$/.test(importer))
            return { id: './vendor/schema-org-v3/index.mjs', external: true }
        },
      },
    },
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
