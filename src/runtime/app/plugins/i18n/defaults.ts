import type { Id } from '@unhead/schema-org'
import type { MaybeRefOrGetter } from 'vue'
import { defineWebPage, defineWebSite } from '@unhead/schema-org/vue'
import { resolveSitePath } from 'nuxt-site-config/urls'
import { defineNuxtPlugin, useError, useRoute, useRuntimeConfig } from 'nuxt/app'
import { hasProtocol, withHttps, withoutTrailingSlash, withTrailingSlash } from 'ufo'
import { computed, toValue } from 'vue'
// @ts-expect-error untyped
import { useLocalePath } from '#i18n'
import { useSiteConfig } from '#site-config/app/composables/useSiteConfig'
import { createSitePathResolver } from '#site-config/app/composables/utils'
import { useSchemaOrg } from '../../composables/useSchemaOrg'
import { useSchemaOrgConfig } from '../../utils/config'
import { maybeAddIdentitySchemaOrg } from '../../utils/shared'

export default defineNuxtPlugin({
  name: 'nuxt-schema-org:defaults',
  dependsOn: [
    // @ts-expect-error generated only when the i18n integration is enabled
    'nuxt-schema-org:meta',
  ],
  setup(nuxtApp) {
    const error = useError()
    if (error.value?.error) {
      return
    }
    const siteConfig = useSiteConfig()
    const schemaOrgConfig = useSchemaOrgConfig()
    const route = useRoute()
    const pathResolver = createSitePathResolver({
      canonical: true,
      absolute: true,
    })
    const identityPathResolver = createSitePathResolver({
      canonical: true,
      absolute: true,
      withBase: true,
    })

    // we need a name by default
    if (!nuxtApp.$i18n)
      return
    interface SchemaOrgI18nLocale {
      code: string
      domain?: string
      language?: string
      iso?: string
    }
    interface SchemaOrgI18n {
      defaultLocale?: MaybeRefOrGetter<string>
      locales: { value: SchemaOrgI18nLocale[] }
      localeProperties: { value: { language?: string } }
    }

    const localePath = useLocalePath()
    const i18n = nuxtApp.$i18n as SchemaOrgI18n
    const locales = i18n.locales.value || []
    const resolveDefaultLocale = (): SchemaOrgI18nLocale | undefined => {
      const defaultLocaleCode = toValue(i18n.defaultLocale)
      const defaultSiteLocale = toValue(siteConfig.defaultLocale)
      return locales.find(locale => locale.code === defaultLocaleCode)
        || locales.find(locale => locale.code === defaultSiteLocale || locale.language === defaultSiteLocale || locale.iso === defaultSiteLocale)
        || (defaultLocaleCode || defaultSiteLocale ? { code: defaultLocaleCode || defaultSiteLocale } : undefined)
    }
    // init vendors
    const siteUrl = () => pathResolver(localePath('index')).value
    const identityId = () => `${withTrailingSlash(identityPathResolver('/').value)}#identity` as Id
    const websiteId = () => `${siteUrl()}#website`
    const website = defineWebSite({
      '@id': websiteId,
      'url': siteUrl,
      'name': () => toValue(siteConfig.name) || '',
      'inLanguage': () => toValue(i18n.localeProperties.value.language) || '',
      'description': () => toValue(siteConfig.description) || '',
    })
    const nuxtBase = useRuntimeConfig().app.baseURL || '/'
    const resolveIdForLocale = (locale: { code: string, domain?: string }) => {
      if (locale.domain) {
        return resolveSitePath(localePath('index', locale.code), {
          absolute: true,
          siteUrl: hasProtocol(locale.domain, { acceptRelative: false }) ? locale.domain : withHttps(locale.domain),
          trailingSlash: siteConfig.trailingSlash,
          base: nuxtBase,
        })
      }
      return pathResolver(localePath('index', locale.code)).value
    }
    if (toValue(siteConfig.defaultLocale)) {
      if (toValue(siteConfig.currentLocale) && toValue(siteConfig.currentLocale) !== toValue(siteConfig.defaultLocale)) {
        website.translationOfWork = {
          '@type': 'WebSite',
          '@id': () => `${resolveIdForLocale(resolveDefaultLocale()!)}#website`,
        }
      }
      else {
        website.workTranslation = locales
          .filter(locale => locale.code !== resolveDefaultLocale()?.code)
          .map((locale) => {
            return {
              '@type': 'WebSite',
              '@id': () => `${resolveIdForLocale(locale)}#website`,
            }
          })
      }
    }
    useSchemaOrg([
      website,
      defineWebPage(computed(() => ({
        about: (schemaOrgConfig.identity || toValue(siteConfig.identity))
          && withoutTrailingSlash(route.path) === withoutTrailingSlash(localePath('index'))
          ? { '@id': identityId() }
          : undefined,
        description: toValue(siteConfig.description) || '',
        isPartOf: {
          '@id': websiteId(),
        },
      }))),
    ])
    maybeAddIdentitySchemaOrg()
  },
})
