import type { NuxtModule } from '@nuxt/schema'
import type { LocalBusinessSimple, OrganizationSimple, PersonSimple } from '@unhead/schema-org'
import type { Script, UseHeadInput } from '@unhead/vue/types'
import type { ModuleRuntimeConfig } from './runtime/types'
import { pathToFileURL } from 'node:url'
import {
  addComponent,
  addImports,
  addPlugin,
  addServerHandler,
  addServerPlugin,
  createResolver,
  defineNuxtModule,
  hasNuxtModule,
  useLogger,
} from '@nuxt/kit'
import { defu } from 'defu'
import { installNuxtSiteConfig } from 'nuxt-site-config/kit'
import { readPackageJSON } from 'pkg-types'
import { setupDevToolsUI } from './devtools'
import { extendTypes, resolveHostUnheadMajor, resolveNuxtContentVersion } from './kit'
import { buildSchemaOrgContentScript } from './runtime/utils/content'
import { resolveSerializableIdentityConfig, schemaOrgVendor } from './unhead-compat'

type SchemaOrgScriptAttributes = Partial<Script> & Record<string, unknown>

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
   * By default, will apply a `data-nuxt-schema-org` attribute. Set to `false` to apply no attributes.
   */
  scriptAttributes?: SchemaOrgScriptAttributes | false
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
      nuxt: '>=3.16.0',
    },
    moduleDependencies: {
      '@nuxtjs/i18n': {
        version: '>=8',
        optional: true,
      },
      'nuxt-i18n-micro': {
        version: '>=1',
        optional: true,
      },
      'nuxt-site-config': {
        version: '>=3.2',
      },
      '@nuxt/content': {
        version: '>=2',
        optional: true,
      },
    },
  },
  defaults(nuxt) {
    return {
      enabled: true,
      defaults: true,
      reactive: nuxt.options.dev || !nuxt.options.ssr,
      minify: !nuxt.options.dev,
      scriptAttributes: {
        'data-nuxt-schema-org': true,
      },
    }
  },
  async setup(config, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const { name, version } = await readPackageJSON(resolve('../package.json'))
    const logger = useLogger(name)
    logger.level = config.debug ? 4 : 3
    if (config.enabled === false) {
      logger.debug('The module is disabled, skipping setup.')
      return
    }
    if (!nuxt.options.ssr && nuxt.options.dev)
      logger.warn('You are using Schema.org with SSR disabled. This is not recommended, Google may not detect your Schema.org, and it adds extra page weight')

    // Pin `@unhead/schema-org` to the major matching the host's unhead. Pairing
    // schema-org v3 with unhead v2 (e.g. current Nuxt) crashes during head
    // resolution; we vendor both majors and alias to the compatible one. See #114.
    const unheadMajor = await resolveHostUnheadMajor(nuxt.options.rootDir)
    const vendor = schemaOrgVendor(unheadMajor, resolve)
    const { defineWebPage } = await import(vendor.vendored ? pathToFileURL(vendor.main).href : vendor.main) as typeof import('@unhead/schema-org')
    const { schemaOrgAutoImports, schemaOrgComponents } = await import(vendor.vendored ? pathToFileURL(vendor.vue).href : vendor.vue) as typeof import('@unhead/schema-org/vue')
    if (vendor.vendored) {
      // Redirect every `@unhead/schema-org` import (bundler + nitro + tsconfig
      // paths) onto the vendored copy. The `/vue` entry must precede the bare
      // one: aliases prefix-match in insertion order, and the bare entry would
      // rewrite the subpath onto index.mjs.
      logger.debug(`Detected unhead v${unheadMajor}, aliasing @unhead/schema-org -> ${vendor.dir}`)
      nuxt.options.alias['@unhead/schema-org/vue'] = vendor.vue
      nuxt.options.alias['@unhead/schema-org'] = vendor.main
      // Inline the vendored files into both the client bundle and the nitro
      // server bundle: nitro's dependency trace can't map files living inside
      // another package's dist back to a resolvable specifier, so anything left
      // external crashes slim `.output/server` images with ERR_MODULE_NOT_FOUND
      // (#116). Their own imports (unhead, @unhead/vue, ufo, vue) stay external
      // and resolve from the host app.
      nuxt.options.build.transpile.push(vendor.dir)
      nuxt.hooks.hook('nitro:config', (nitroConfig) => {
        nitroConfig.alias = nitroConfig.alias || {}
        nitroConfig.alias['@unhead/schema-org/vue'] = vendor.vue
        nitroConfig.alias['@unhead/schema-org'] = vendor.main
        nitroConfig.externals = nitroConfig.externals || {}
        nitroConfig.externals.inline = nitroConfig.externals.inline || []
        nitroConfig.externals.inline.push(vendor.dir)
      })
    }
    else if (vendor.main !== '@unhead/schema-org') {
      // repo dev/stub fallback on an unhead v2 host: alias to the npm-aliased
      // v2 package from the workspace devDependencies; substring replacement
      // keeps subpaths like `/vue` intact.
      logger.debug(`Detected unhead v${unheadMajor}, aliasing @unhead/schema-org -> ${vendor.main}`)
      nuxt.options.alias['@unhead/schema-org'] = vendor.main
      nuxt.options.build.transpile.push(vendor.main)
      nuxt.hooks.hook('nitro:config', (nitroConfig) => {
        nitroConfig.alias = nitroConfig.alias || {}
        nitroConfig.alias['@unhead/schema-org'] = vendor.main
        nitroConfig.externals = nitroConfig.externals || {}
        nitroConfig.externals.inline = nitroConfig.externals.inline || []
        nitroConfig.externals.inline.push(vendor.main)
      })
    }

    await installNuxtSiteConfig()

    const runtimeConfig: ModuleRuntimeConfig = {
      reactive: config.reactive,
      minify: config.minify,
      scriptAttributes: config.scriptAttributes,
      identity: resolveSerializableIdentityConfig(config.identity),
      version: version!,
    }
    // avoid polluting client-side bundle if we don't need to
    if (config.reactive)
      nuxt.options.runtimeConfig.public['nuxt-schema-org'] = runtimeConfig
    // for devtools debugging
    // @ts-expect-error untyped
    nuxt.options.runtimeConfig['nuxt-schema-org'] = runtimeConfig

    // @ts-expect-error untyped
    const hasI18n = hasNuxtModule('@nuxtjs/i18n') && nuxt.options.i18n?.locales
    const pluginPath = hasI18n ? './runtime/app/plugins/i18n' : './runtime/app/plugins'
    addPlugin({
      src: resolve(pluginPath, 'init'),
      mode: config.reactive ? 'all' : 'server',
    })
    if (hasI18n) {
      addPlugin({
        src: resolve(pluginPath, 'meta'),
        mode: config.reactive ? 'all' : 'server',
      })
    }
    if (config.defaults) {
      addPlugin({
        src: resolve(pluginPath, 'defaults'),
        mode: config.reactive ? 'all' : 'server',
      })
    }

    nuxt.options.alias['#schema-org'] = resolve('./runtime')

    const contentVersion = await resolveNuxtContentVersion()
    const isNuxtContentV3 = contentVersion && contentVersion.version === 3
    const isNuxtContentV2 = contentVersion && contentVersion.version === 2
    if (isNuxtContentV3) {
      nuxt.hooks.hook('content:file:afterParse', (ctx) => {
        if (typeof ctx.content.schemaOrg === 'undefined') {
          return
        }
        const content = ctx.content
        const script = buildSchemaOrgContentScript(content.schemaOrg, defineWebPage, config.scriptAttributes) as Script & { nodes: any }

        content.head = defu(<UseHeadInput<any>> { script: [script] }, content.head)
        ctx.content = content
      })
    }
    else if (isNuxtContentV2) {
      addServerPlugin(resolve('./runtime/server/plugins/nuxt-content-v2'))
    }

    if (!config.reactive)
      // tree-shake all schema-org functions
      nuxt.options.optimization.treeShake.composables.client['nuxt-schema-org'] = schemaOrgAutoImports[0]!.imports

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
      schemaOrgAutoImports[0]!.imports = schemaOrgAutoImports[0]!.imports.filter((i: string) => i !== 'useSchemaOrg')
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
