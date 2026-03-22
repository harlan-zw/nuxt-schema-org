import type { MetaInput as _MetaInput, MetaInput } from '@unhead/schema-org/vue'
import type { NuxtApp } from 'nuxt/app'
import { injectHead, useHead } from '#imports'
import {
  useSiteConfig,
} from '#site-config/app/composables/useSiteConfig'
import { createSitePathResolver } from '#site-config/app/composables/utils'
import { SchemaOrgUnheadPlugin } from '@unhead/schema-org/vue'
import { resolveSitePath } from 'nuxt-site-config/urls'
import { useRoute, useRuntimeConfig } from 'nuxt/app'
import { camelCase } from 'scule'
import { withTrailingSlash } from 'ufo'
import { toValue, watch } from 'vue'
import { useSchemaOrg } from '../composables/useSchemaOrg'
import { useSchemaOrgConfig } from './config'

function resolvePathDirect(siteConfig: Record<string, any>, path: string, options: { absolute?: boolean, withBase?: boolean, canonical?: boolean }) {
  const nuxtBase = useRuntimeConfig().app.baseURL || '/'
  return resolveSitePath(path, {
    absolute: options.absolute,
    withBase: options.withBase,
    siteUrl: toValue(siteConfig.url),
    trailingSlash: toValue(siteConfig.trailingSlash),
    base: nuxtBase,
  })
}

export function initPlugin(nuxtApp: NuxtApp) {
  const head = injectHead()
  const config = useSchemaOrgConfig()
  const route = useRoute()

  const siteConfig = useSiteConfig()

  // on the server, resolve paths directly without creating computed refs to avoid leaking reactive scopes
  const resolveUrl = import.meta.server
    ? (path: string) => resolvePathDirect(siteConfig, path, { canonical: true, absolute: true, withBase: true })
    : createSitePathResolver({ canonical: true, absolute: true, withBase: true })

  function resolveSchemaOrg() {
    const siteConfigResolved: Record<string, any> = {}
    for (const key in siteConfig) {
      if (key.startsWith('_')) {
        continue
      }
      siteConfigResolved[key] = toValue(siteConfig[key])
      // recursive check
      if (typeof siteConfigResolved[key] === 'object') {
        for (const k in siteConfigResolved[key]) {
          siteConfigResolved[key][k] = toValue(siteConfigResolved[key][k])
        }
      }
    }
    return {
      ...(route.meta?.schemaOrg || {}),
      ...siteConfigResolved as Record<string, string>,
      url: toValue(resolveUrl(route.path)),
      host: withTrailingSlash(toValue(resolveUrl('/'))),
      inLanguage: toValue(siteConfigResolved.currentLocale) || toValue(siteConfigResolved.defaultLocale),
      path: route.path,
    } satisfies MetaInput
  }
  const templateParamEntry = useHead({
    templateParams: { schemaOrg: resolveSchemaOrg() },
  })
  // only watch for siteConfig changes on the client to avoid leaking reactive scopes during SSR
  if (import.meta.client) {
    watch(() => siteConfig, () => {
      templateParamEntry!.patch({
        templateParams: { schemaOrg: resolveSchemaOrg() },
      })
    }, { deep: true })
  }
  head.use(
    SchemaOrgUnheadPlugin({} as _MetaInput, async () => {
      const meta = {} as MetaInput
      // call hook
      await nuxtApp.hooks.callHook('schema-org:meta', meta)
      return meta as _MetaInput
    }, {
      minify: config.minify,
      trailingSlash: siteConfig.trailingSlash,
    }),
  )
}

export function maybeAddIdentitySchemaOrg() {
  const config = useSchemaOrgConfig()
  const siteConfig = useSiteConfig({
    resolveRefs: true,
  })
  if (config.identity || siteConfig.identity) {
    const identity = config.identity || siteConfig.identity
    let identityPayload: Record<string, any> = {
      name: () => toValue(siteConfig.name),
      url: () => toValue(siteConfig.url),
    }
    let identityType: string
    if (typeof identity !== 'string') {
      identityPayload = {
        ...identityPayload,
        ...identity,
      }
      identityType = identity.type
      // Remove type from object to avoid invalid markup
      delete identityPayload.type
    }
    else {
      identityType = identity
    }
    if (siteConfig.twitter) {
      // without the @
      const id = siteConfig.twitter.startsWith('@')
        ? siteConfig.twitter.slice(1)
        : siteConfig.twitter
      identityPayload.sameAs = [
        `https://twitter.com/${id}`,
      ]
    }
    identityPayload._resolver = identityPayload._resolver || camelCase(identityType)
    useSchemaOrg([identityPayload])
  }
}
