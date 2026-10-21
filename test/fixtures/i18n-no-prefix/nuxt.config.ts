import NuxtSchemaOrg from '../../../src/module'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  modules: [
    NuxtSchemaOrg,
    'nuxt-seo-utils',
    '@nuxtjs/i18n',
  ],
  schemaOrg: {
    identity: 'Organization',
  },
  site: {
    url: 'https://nuxtseo.com',
    name: 'nuxt-schema-org',
    description: 'The quickest and easiest way to build Schema.org graphs for Nuxt.',
  },
  // @ts-expect-error untyped
  i18n: {
    langDir: './locales',
    baseUrl: 'https://nuxtseo.com',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
    defaultLocale: 'en',
    strategy: 'no_prefix',
    locales: [
      {
        code: 'en',
        language: 'en-US',
        file: 'en.ts',
      },
      {
        code: 'ja',
        language: 'ja',
        file: 'ja.ts',
      },
    ],
  },

  compatibilityDate: '2024-07-22',
})