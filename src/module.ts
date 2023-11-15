import {
  addComponent,
  addImports,
  addPlugin,
  addServerHandler,
  createResolver,
  defineNuxtModule,
  useLogger,
} from '@nuxt/kit'

// @ts-expect-error not sure why this is happening
import { schemaOrgAutoImports, schemaOrgComponents } from '@unhead/schema-org/vue'
import type { NuxtModule } from '@nuxt/schema'
import { installNuxtSiteConfig } from 'nuxt-site-config-kit'
import type { MetaInput } from '@unhead/schema-org'
import { version } from '../package.json'
import { setupDevToolsUI } from './devtools'
import type { ModuleRuntimeConfig } from './runtime/types'

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

    const runtimeConfig: ModuleRuntimeConfig = {
      reactive: config.reactive,
      minify: config.minify,
      version,
    }
    // avoid polluting client-side bundle if we don't need to
    if (config.reactive)
      nuxt.options.runtimeConfig.public['nuxt-schema-org'] = runtimeConfig
    else
      nuxt.options.runtimeConfig['nuxt-schema-org'] = runtimeConfig

    nuxt.options.build.transpile.push('@unhead/schema-org')

    addPlugin({
      src: resolve('runtime/plugin'),
      mode: config.reactive ? 'all' : 'server',
    })
    if (!config.reactive)
      // tree-shake all schema-org functions
      nuxt.options.optimization.treeShake.composables.client['nuxt-schema-org'] = schemaOrgAutoImports[0].imports

    for (const component of schemaOrgComponents) {
      await addComponent({
        name: component,
        export: component,
        chunkName: 'nuxt-schema-org/components',
        filePath: '@unhead/schema-org/vue',
      })
    }

    addImports({
      from: resolve('./runtime/useSchemaOrg'),
      name: 'useSchemaOrg',
    })

    nuxt.hooks.hook('imports:sources', (autoImports) => {
      schemaOrgAutoImports[0].imports = schemaOrgAutoImports[0].imports.filter((i: string) => i !== 'useSchemaOrg')
      autoImports.unshift(...schemaOrgAutoImports)
    })

    if (config.debug || nuxt.options.dev) {
      addServerHandler({
        route: '/__schema-org__/debug.json',
        handler: resolve('./runtime/routes/__schema-org__/debug'),
      })
    }

    if (nuxt.options.dev)
      setupDevToolsUI(config, resolve)
  },
}) as NuxtModule<ModuleOptions>
