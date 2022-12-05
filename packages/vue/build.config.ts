import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
  },
  entries: [
    { input: 'src/index' },
    { input: 'runtime/', outDir: 'dist/runtime', builder: 'mkdist' },
  ],
  hooks: {
    // 'mkdist:done': async function (ctx) {
    //   const runtimeSimpleDir = `${ctx.options.outDir}/runtime`
    //   const runtimeFullDir = `${ctx.options.outDir}/runtime-schema-dts`
    //   await copy(runtimeSimpleDir, runtimeFullDir)
    //
    //   const simpleDtsFile = `${runtimeSimpleDir}/provider.d.ts`
    //   const simpleDts = await readFile(simpleDtsFile, { encoding: 'utf-8' })
    //   const fullDts = simpleDts
    //     .replace('from \'schema-org-graph\';', 'from \'schema-dts\';')
    //   await writeFile(`${runtimeFullDir}/provider.d.ts`, fullDts, { encoding: 'utf-8' })
    // },
  },
  externals: [
    'vite',
    'vue-router',
    '@unhead/vue',
    '@vueuse/head',
    'unplugin-ast',
    'unplugin',
    'unplugin-vue-components',
    'vue',
  ],
})
