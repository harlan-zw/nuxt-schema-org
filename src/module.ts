import type { NuxtModule } from '@nuxt/schema'
import type { DataKeys, ScriptBase, TagUserProperties } from '@unhead/schema'
import type { LocalBusinessSimple, OrganizationSimple, PersonSimple } from '@unhead/schema-org'
import type { ModuleRuntimeConfig } from './runtime/types'
import {
  addComponent,
  addImports,
  addPlugin,
  addServerHandler,
  addServerPlugin,
  createResolver,
  defineNuxtModule,
  hasNuxtModule,
  hasNuxtModuleCompatibility,
  useLogger,
} from '@nuxt/kit'
import { schemaOrgAutoImports, schemaOrgComponents } from '@unhead/schema-org/vue'
import { installNuxtSiteConfig } from 'nuxt-site-config-kit'
import { version } from '../package.json'
import { setupDevToolsUI } from './devtools'
import { extendTypes } from './kit'

export interface ModuleOptions {
  /**
   * Whether a default WebPage, WebSite and Identity node be created.
   */
  defaults?: boolean
  /**
   * The identity of the site.
   */
  identity?: 'Person' | 'Organization' | 'LocalBusiness' | OrganizationSimple | PersonSimple | LocalBusinessSimple
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
   * Attributes to apply to the script tag containing the LD+JSON Schema.org snippet.
   *
   * By default, will apply an `id` of `schema-org-graph`. Set to `false` to apply no attributes.
   */
  scriptAttributes?: (ScriptBase & TagUserProperties & DataKeys) | false
  /**
   * Enables debug logs.
   *
   * @default false
   */
  debug: boolean
}

export interface ModuleHooks {
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-schema-org',
    configKey: 'schemaOrg',
    compatibility: {
      nuxt: '>=3.7.0',
      bridge: false,
    },
  },
  defaults(nuxt) {
    return {
      enabled: true,
      debug: false,
      defaults: true,
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

    if (typeof config.scriptAttributes === 'undefined') {
      config.scriptAttributes = {
        id: 'schema-org-graph',
      }
    }

    const { resolve } = createResolver(import.meta.url)
    await installNuxtSiteConfig()

    const runtimeConfig: ModuleRuntimeConfig = {
      reactive: config.reactive,
      minify: config.minify,
      scriptAttributes: config.scriptAttributes,
      identity: config.identity,
      version,
    }
    // avoid polluting client-side bundle if we don't need to
    if (config.reactive)
      nuxt.options.runtimeConfig.public['nuxt-schema-org'] = runtimeConfig
    else
      // @ts-expect-error untyped
      nuxt.options.runtimeConfig['nuxt-schema-org'] = runtimeConfig

    // @ts-expect-error untyped
    const pluginPath = (hasNuxtModule('@nuxtjs/i18n') && nuxt.options.i18n?.locales) ? './runtime/app/plugins/i18n' : './runtime/app/plugins'
    addPlugin({
      src: resolve(pluginPath, 'init'),
      mode: config.reactive ? 'all' : 'server',
    })
    if (config.defaults) {
      addPlugin({
        src: resolve(pluginPath, 'defaults'),
        mode: config.reactive ? 'all' : 'server',
      })
    }

    nuxt.options.alias['#schema-org'] = resolve('./runtime')

    // convert ogImage key to head data
    if (hasNuxtModule('@nuxt/content') && await hasNuxtModuleCompatibility('@nuxt/content', '^2')) {
      addServerPlugin(resolve('./runtime/server/plugins/nuxt-content'))
    }

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
      from: resolve('./runtime/app/composables/useSchemaOrg'),
      name: 'useSchemaOrg',
    })

    nuxt.hooks.hook('imports:sources', (autoImports) => {
      schemaOrgAutoImports[0].imports = schemaOrgAutoImports[0].imports.filter((i: string) => i !== 'useSchemaOrg')
      autoImports.unshift(...schemaOrgAutoImports)
    })

    extendTypes('nuxt-schema-org', ({ typesPath }) => {
      return `
declare module '@nuxt/schema' {
  export interface RuntimeNuxtHooks {
    'schema-org:meta': (meta: import('${typesPath}').MetaInput) => void | Promise<void>
  }
}
declare module '#app' {
  export interface RuntimeNuxtHooks {
    'schema-org:meta': (meta: import('${typesPath}').MetaInput) => void | Promise<void>
  }
}
`
    })

    if (config.debug || nuxt.options.dev) {
      addServerHandler({
        route: '/__schema-org__/debug.json',
        handler: resolve('./runtime/server/routes/__schema-org__/debug'),
      })
    }

    if (nuxt.options.dev)
      setupDevToolsUI(config, resolve)
  },
}) as NuxtModule<ModuleOptions>
