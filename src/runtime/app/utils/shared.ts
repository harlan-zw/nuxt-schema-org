import type { MetaInput as _MetaInput, MetaInput } from '@unhead/schema-org'
import type { NuxtApp } from 'nuxt/app'
import {
  useSiteConfig,
} from '#site-config/app/composables/useSiteConfig'
import { createSitePathResolver } from '#site-config/app/composables/utils'
import { SchemaOrgUnheadPlugin } from '@unhead/schema-org/vue'
import { injectHead } from '@unhead/vue'
import { defu } from 'defu'
import { useRoute } from 'nuxt/app'
import { camelCase } from 'scule'
import { withoutTrailingSlash } from 'ufo'
import { computed } from 'vue'
import { useSchemaOrg } from '../composables/useSchemaOrg'
import { useSchemaOrgConfig } from './config'

export function initPlugin(nuxtApp: NuxtApp) {
  const head = injectHead()
  const config = useSchemaOrgConfig()
  const route = useRoute()

  const siteConfig = useSiteConfig()
  const resolvePath = createSitePathResolver({
    absolute: false,
    withBase: true,
  })
  const resolveUrl = createSitePathResolver({
    canonical: true,
    absolute: true,
    withBase: true,
  })
  const schemaOrg = computed(() => {
    return {
      ...(route.meta?.schemaOrg || {}),
      ...siteConfig as Record<string, string>,
      url: resolveUrl(route.path),
      host: withoutTrailingSlash(siteConfig.url),
      inLanguage: siteConfig.currentLocale || siteConfig.defaultLocale,
      path: resolvePath(route.path),
    }
  })
  head.push({ templateParams: { schemaOrg } })
  head.use(
    SchemaOrgUnheadPlugin({} as _MetaInput, async () => {
      const meta: MetaInput = {}
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
  const siteConfig = useSiteConfig()
  if (config.identity || siteConfig.identity) {
    const identity = config.identity || siteConfig.identity
    let identityPayload: Record<string, any> = {
      name: siteConfig.name,
      url: siteConfig.url,
    }
    let identityType: string
    if (typeof identity !== 'string') {
      identityPayload = defu(identity, identityPayload)
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
