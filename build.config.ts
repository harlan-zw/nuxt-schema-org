import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  rollup: {
    emitCJS: true,
  },
  entries: [
    { input: 'src/schema', name: 'schema' },
    { input: 'src/content', name: 'content' },
  ],
  externals: [
    'h3',
    'std-env',
    'nitropack',
    'consola',
    '@nuxt/content',
    'zod',
    '@unhead/vue',
    '@unhead/schema',
    '@unhead/schema-org/vue',
  ],
})
