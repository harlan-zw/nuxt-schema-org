import NuxtSchemaOrg from '../../../src/module'

export default defineNuxtConfig({
  modules: [NuxtSchemaOrg, '@nuxtjs/i18n'],
  app: { baseURL: '/docs/' },
  site: { name: 'Domain translations' },
  // @ts-expect-error untyped
  i18n: {
    strategy: 'prefix_except_default',
    multiDomainLocales: true,
    detectBrowserLanguage: false,
    defaultLocale: 'en',
    customRoutes: 'config',
    pages: { index: { en: '/en/welcome', de: '/willkommen', fr: '/bonjour' } },
    locales: [
      { code: 'en', language: 'en', domains: ['https://en.example', 'https://de.example'], defaultForDomains: ['https://en.example'] },
      { code: 'de', language: 'de', domains: ['https://en.example', 'https://de.example'], defaultForDomains: ['https://de.example'] },
      { code: 'fr', language: 'fr' },
    ],
  },
  compatibilityDate: '2026-09-12',
})
