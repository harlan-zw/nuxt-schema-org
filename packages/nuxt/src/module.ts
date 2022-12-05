import {
  addComponent,
  addPlugin,
  addTemplate,
  createResolver,
  defineNuxtModule,
} from '@nuxt/kit'
import type { MetaInput, UserConfig } from '@unhead/schema-org-vue'
import { schemaOrgAutoImports, schemaOrgComponents } from '@unhead/schema-org-vue'
import type { NuxtModule } from '@nuxt/schema'

export interface ModuleOptions extends UserConfig {}

export interface ModuleHooks {

}

declare module '@nuxt/schema' {
  export interface RuntimeNuxtHooks {
    'schema-org:meta': (meta: MetaInput) => void
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    configKey: 'schemaOrg',
    compatibility: {
      nuxt: '3.0.0',
      bridge: false,
    },
  },
  async setup(moduleOptions, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    // moduleOptions = resolveUserConfig(moduleOptions)

    // spa we can read the window.origin as a fallback
    // if (nuxt.options.ssr && !moduleOptions.canonicalHost && !moduleOptions.meta?.host)
    //   console.warn('WARN [nuxt-schema-org] Please provide a `canonicalHost` when using this module with SSR enabled.')

    // if ssr is disabled we need to inject the client
    // if (!nuxt.options.ssr)
    //   moduleOptions.client = true
    // // enable client in dev mode
    // if (typeof moduleOptions.client === 'undefined')
    //   moduleOptions.client = !!nuxt.options.dev

    // set the runtime alias so nuxt knows where our types are
    const moduleRuntimeDir = resolve('./runtime')

    addPlugin({
      src: resolve(moduleRuntimeDir, 'plugin'),
      mode: nuxt.options.dev ? 'all' : 'server',
    })

    nuxt.options.alias['#nuxt-schema-org/config'] = addTemplate({
      filename: 'nuxt-schema-org-config.mjs',
      getContents: () => `export default ${JSON.stringify(moduleOptions)}`,
    }).dst

    for (const component of schemaOrgComponents) {
      await addComponent({
        name: component,
        export: component,
        chunkName: 'nuxt-schema-org/components',
        filePath: '@unhead/schema-org-vue',
      })
    }

    nuxt.hooks.hook('imports:sources', (autoImports) => {
      autoImports.unshift(...schemaOrgAutoImports)
    })
  },
}) as NuxtModule<ModuleOptions>
