import {
  addComponent,
  addPlugin,
  createResolver,
  defineNuxtModule, useLogger,
} from '@nuxt/kit'
// @ts-expect-error ?
import { schemaOrgAutoImports, schemaOrgComponents } from '@unhead/schema-org/vue'
import type { NuxtModule } from '@nuxt/schema'
import { installNuxtSiteConfig, updateSiteConfig } from 'nuxt-site-config-kit'

export interface ModuleOptions {
  /**
   * Whether the module should be loaded.
   *
   * @default true
   */
  enabled: boolean
  /**
   * Enables debug logs.
   *
   * @default false
   */
  debug: boolean
  // some actually useful options not covered by site config
  currency?: string
  image?: string
  /**
   * @deprecated Use site config
   */
  inLanguage?: string
  /**
   * @deprecated Use site config
   */
  trailingSlash?: boolean
  /**
   * @deprecated Use site config
   */
  host?: string
  /**
   * @deprecated Use site config
   */
  url?: string
  /**
   * @deprecated Remove.
   */
  path?: string
  /**
   * @deprecated Remove.
   */
  title?: string
  /**
   * @deprecated Remove.
   */
  description?: string
  /**
   * @deprecated Remove.
   */
  datePublished?: Date | string
  /**
   * @deprecated Remove.
   */
  dateModified?: Date | string
}

export interface ModuleHooks {

}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-schema-org',
    configKey: 'schemaOrg',
    compatibility: {
      nuxt: '^3.6.1',
      bridge: false,
    },
  },
  defaults: {
    enabled: true,
    debug: false,
  },
  async setup(config, nuxt) {
    const logger = useLogger('nuxt-schema-org')
    logger.level = (config.debug || nuxt.options.debug) ? 4 : 3
    if (config.enabled === false) {
      logger.debug('The module is disabled, skipping setup.')
      return
    }
    const { resolve } = createResolver(import.meta.url)
    await installNuxtSiteConfig()
    if (config.host || config.url) {
      updateSiteConfig({
        url: config.host || config.url,
        trailingSlash: config.trailingSlash,
        defaultLocale: config.inLanguage,
        _context: 'nuxt-schema-org',
      })
    }

    // set the runtime alias so nuxt knows where our types are
    const moduleRuntimeDir = resolve('./runtime')

    nuxt.options.runtimeConfig.public['nuxt-schema-org'] = config

    nuxt.options.build.transpile.push(...[
      moduleRuntimeDir,
      '@unhead/schema-org',
    ])

    addPlugin({
      src: resolve(moduleRuntimeDir, 'plugin'),
      mode: (nuxt.options.dev || !nuxt.options.ssr) ? 'all' : 'server',
    })

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
  },
}) as NuxtModule<ModuleOptions>
