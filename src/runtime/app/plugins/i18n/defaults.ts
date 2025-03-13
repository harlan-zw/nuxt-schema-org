// @ts-expect-error untyped
import { useLocalePath } from '#i18n'
import { useSiteConfig } from '#site-config/app/composables/useSiteConfig'
import { createSitePathResolver } from '#site-config/app/composables/utils'
import { defineWebPage, defineWebSite } from '@unhead/schema-org/vue'
import { resolveSitePath } from 'nuxt-site-config/urls'
import { defineNuxtPlugin, useError, useRuntimeConfig } from 'nuxt/app'
import { hasProtocol, withHttps } from 'ufo'
import { toValue } from 'vue'
import { useSchemaOrg } from '../../composables/useSchemaOrg'
import { maybeAddIdentitySchemaOrg } from '../../utils/shared'

export default defineNuxtPlugin({
  name: 'nuxt-schema-org:defaults',
  dependsOn: [
    'nuxt-schema-org:init',
  ],
  setup(nuxtApp) {
    const error = useError()
    if (error.value?.error) {
      return
    }
    const siteConfig = useSiteConfig()
    const pathResolver = createSitePathResolver({
      canonical: true,
      absolute: true,
    })

    // we need a name by default
    if (!nuxtApp.$i18n)
      return
    const localePath = useLocalePath()
    // @ts-expect-error untyped
    const locales = nuxtApp.$i18n?.locales.value || []
    // init vendors
    const siteUrl = () => pathResolver(localePath('index')).value
    const websiteId = () => `${siteUrl()}#website`
    const website = defineWebSite({
      '@id': websiteId,
      'url': siteUrl,
      'name': () => toValue(siteConfig.name) || '',
      // @ts-expect-error untyped
      'inLanguage': () => toValue(nuxtApp.$i18n.localeProperties.value.language) || '',
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
    if (siteConfig.defaultLocale) {
      if (siteConfig.currentLocale && siteConfig.currentLocale !== siteConfig.defaultLocale) {
        website.translationOfWork = {
          '@type': 'WebSite',
          '@id': () => `${resolveIdForLocale({ code: toValue(siteConfig.defaultLocale) })}#website`,
        }
      }
      else {
        website.workTranslation = locales
          // @ts-expect-error untyped
          .filter(locale => locale.code !== siteConfig.defaultLocale)
          // @ts-expect-error untyped
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
      defineWebPage({
        isPartOf: {
          '@id': websiteId(),
        },
      }),
    ])
    maybeAddIdentitySchemaOrg()
  },
})
