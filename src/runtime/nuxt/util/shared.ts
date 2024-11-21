import type { MetaInput as _MetaInput, MetaInput, Organization, Person } from '@unhead/schema-org'
import type { H3Event } from 'h3'
import type { NuxtApp } from 'nuxt/app'
import type { ModuleRuntimeConfig } from '../../types'
import {
  createSitePathResolver,
  defineOrganization,
  definePerson,
  injectHead,
  useRoute,
  useRuntimeConfig,
  useSchemaOrg,
  useSiteConfig,
} from '#imports'
import { SchemaOrgUnheadPlugin } from '@unhead/schema-org'
import { defu } from 'defu'
import { withoutTrailingSlash } from 'ufo'
import { computed } from 'vue'

export function useSchemaOrgConfig(e?: H3Event) {
  const runtimeConfig = useRuntimeConfig(e)
  return defu(import.meta.client ? runtimeConfig.public['nuxt-schema-org'] : runtimeConfig['nuxt-schema-org'], {
    scriptAttributes: {},
  }) as ModuleRuntimeConfig
}

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
    let identityPayload: Person | Organization = {
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
    useSchemaOrg([
      identityType === 'Person'
        ? definePerson(identityPayload)
        : defineOrganization(identityPayload),
    ])
  }
}
