import { defineBuildConfig } from 'unbuild'
export default defineBuildConfig({
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
  },
  entries: [
    { input: 'src/index' },
  ],
  externals: [
    'vite',
    'vue-router',
    '@unhead/vue',
    'unplugin-ast',
    'unplugin',
    'unplugin-vue-components',
    'vue',
    '@vue/runtime-core',
  ],
})
