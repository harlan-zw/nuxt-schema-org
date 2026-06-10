import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  rollup: {
    emitCJS: true,
    // `schema.ts` re-exports @unhead/schema-org, which is a devDependency only:
    // the published package vendors both majors under dist/vendor instead of
    // depending on them (#125), so the re-export must be bundled in.
    inlineDependencies: ['@unhead/schema-org'],
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
    '@unhead/vue/types',
  ],
})
