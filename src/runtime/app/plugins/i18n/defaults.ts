import type { Id } from '@unhead/schema-org'
import type { RuntimeI18nConfig, RuntimeLocale } from 'nuxtseo-shared/i18n-runtime'
import type { MaybeRefOrGetter } from 'vue'
import { defineWebPage, defineWebSite } from '@unhead/schema-org/vue'
import { resolveSitePath } from 'nuxt-site-config/urls'
import { defineNuxtPlugin, useError, useRoute, useRuntimeConfig } from 'nuxt/app'
import { resolveCanonicalLocaleDomain, localePath as resolveLocalePath } from 'nuxtseo-shared/i18n-runtime'
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
      withBase: true,
    })

    // we need a name by default
    if (!nuxtApp.$i18n)
      return
    interface SchemaOrgI18nLocale extends Omit<RuntimeLocale, 'hreflang'> {
      iso?: string
    }
    interface SchemaOrgI18n {
      defaultLocale?: MaybeRefOrGetter<string>
      locales: { value: SchemaOrgI18nLocale[] }
      localeProperties: { value: SchemaOrgI18nLocale }
      strategy: RuntimeI18nConfig['strategy']
    }

    const localePath = useLocalePath()
    const i18n = nuxtApp.$i18n as SchemaOrgI18n
    const locales = i18n.locales.value || []
    const runtimeConfig = useRuntimeConfig()
    const globalDefault = (runtimeConfig.public.i18n as { defaultLocale?: string }).defaultLocale || toValue(i18n.defaultLocale)
    const resolveDefaultLocale = (): SchemaOrgI18nLocale | undefined => {
      const defaultLocaleCode = globalDefault
      const defaultSiteLocale = toValue(siteConfig.defaultLocale)
      return locales.find(locale => locale.code === defaultLocaleCode)
        || locales.find(locale => locale.code === defaultSiteLocale || locale.language === defaultSiteLocale || locale.iso === defaultSiteLocale)
        || (defaultLocaleCode || defaultSiteLocale ? { code: defaultLocaleCode || defaultSiteLocale } : undefined)
    }
    // init vendors
    const siteUrl = () => resolveIdForLocale(i18n.localeProperties.value)
    const identityId = () => `${withTrailingSlash(pathResolver('/').value)}#identity` as Id
    const websiteId = () => `${siteUrl()}#website`
    const website = defineWebSite({
      '@id': websiteId,
      'url': siteUrl,
      'name': () => toValue(siteConfig.name) || '',
      'inLanguage': () => toValue(i18n.localeProperties.value.language) || '',
      'description': () => toValue(siteConfig.description) || '',
    })
    const runtimeI18n: RuntimeI18nConfig = {
      defaultLocale: globalDefault,
      strategy: i18n.strategy,
      locales: locales.map(locale => ({ ...locale, hreflang: locale.language || locale.iso || locale.code })),
    }
    const canonicalDefault = runtimeI18n.locales.find(locale => locale.code === globalDefault)
    const resolveIdForLocale = (locale: SchemaOrgI18nLocale) => {
      const path = localePath('index', locale.code)
      const domain = resolveCanonicalLocaleDomain(runtimeI18n.locales.find(item => item.code === locale.code), canonicalDefault)
      if (domain) {
        const prefixed = i18n.strategy === 'prefix'
          || (i18n.strategy !== 'no_prefix' && locale.code !== toValue(i18n.defaultLocale))
        const prefix = `/${locale.code}`
        const basePath = prefixed && (path === prefix || path.startsWith(`${prefix}/`)) ? path.slice(prefix.length) || '/' : path
        return resolveSitePath(resolveLocalePath(basePath, locale.code, runtimeI18n, { host: domain }), {
          absolute: true,
          siteUrl: hasProtocol(domain, { acceptRelative: false }) ? domain : withHttps(domain),
          trailingSlash: siteConfig.trailingSlash,
          base: runtimeConfig.app.baseURL,
          withBase: true,
        })
      }
      return pathResolver(path).value
    }
    if (resolveDefaultLocale()) {
      if (i18n.localeProperties.value.code !== resolveDefaultLocale()?.code) {
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
        // null blocks identity resolver defaults and is stripped from the graph
        about: (schemaOrgConfig.identity || toValue(siteConfig.identity))
          && withoutTrailingSlash(route.path) === withoutTrailingSlash(localePath('index'))
          ? { '@id': identityId() }
          : null,
        description: toValue(siteConfig.description) || '',
        isPartOf: {
          '@id': websiteId(),
        },
      }))),
    ])
    maybeAddIdentitySchemaOrg()
  },
})
