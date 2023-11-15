import {
  addComponent,
  addPlugin,
  createResolver,
  defineNuxtModule,
  useLogger,
} from '@nuxt/kit'

// @ts-expect-error not sure why this is happening
import { schemaOrgAutoImports, schemaOrgComponents } from '@unhead/schema-org/vue'
import type { NuxtModule } from '@nuxt/schema'
import { installNuxtSiteConfig } from 'nuxt-site-config-kit'
import type { MetaInput } from '@unhead/schema-org'
import { setupDevToolsUI } from './devtools'

export interface ModuleOptions {
  /**
   * Whether the module should be loaded.
   *
   * @default true
   */
  enabled: boolean
  /**
   * Whether the output should be minified.
   *
   * @default `process.env.NODE_ENV === 'production'`
   */
  minify: boolean
  /**
   * Whether the output should be reactive or just use the initial SSR output.
   *
   * @default `process.dev || !nuxt.options.ssr`
   */
  reactive: boolean
  /**
   * Enables debug logs.
   *
   * @default false
   */
  debug: boolean
}

export interface ModuleHooks {
  'schema-org:meta': (meta: MetaInput) => void | Promise<void>
}

export interface ModulePublicRuntimeConfig {
  ['nuxt-schema-org']: MetaInput
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-schema-org',
    configKey: 'schemaOrg',
    compatibility: {
      nuxt: '^3.7.0',
      bridge: false,
    },
  },
  defaults(nuxt) {
    return {
      enabled: true,
      debug: false,
      reactive: nuxt.options.dev || !nuxt.options.ssr,
      minify: !nuxt.options.dev,
    }
  },
  async setup(config, nuxt) {
    const logger = useLogger('nuxt-schema-org')
    logger.level = (config.debug || nuxt.options.debug) ? 4 : 3
    if (config.enabled === false) {
      logger.debug('The module is disabled, skipping setup.')
      return
    }
    if (!nuxt.options.ssr && nuxt.options.dev)
      logger.warn('You are using Schema.org with SSR disabled. This is not recommended, Google may not detect your Schema.org, and it adds extra page weight')

    const { resolve } = createResolver(import.meta.url)
    await installNuxtSiteConfig()

    // set the runtime alias so nuxt knows where our types are
    const moduleRuntimeDir = resolve('./runtime')

    nuxt.options.runtimeConfig.public['nuxt-schema-org'] = config

    nuxt.options.build.transpile.push(...[
      moduleRuntimeDir,
      '@unhead/schema-org',
    ])

    addPlugin({
      src: resolve(moduleRuntimeDir, 'plugin'),
      mode: config.reactive ? 'all' : 'server',
    })
    if (!config.reactive)
      // useSchemaOrg is a server-only composable
      nuxt.options.optimization.treeShake.composables.client['nuxt-schema-org'] = ['useSchemaOrg']

    for (const component of schemaOrgComponents) {
      await addComponent({
        name: component,
        export: component,
        chunkName: 'nuxt-schema-org/components',
        filePath: '@unhead/schema-org/vue',
      })
    }

    nuxt.hooks.hook('imports:sources', (autoImports) => {
      autoImports.unshift(...schemaOrgAutoImports)
    })

    if (config.debug || nuxt.options.dev)
      setupDevToolsUI(config, resolve)
  },
}) as NuxtModule<ModuleOptions>
