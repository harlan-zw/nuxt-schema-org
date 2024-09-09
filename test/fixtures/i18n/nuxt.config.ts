import NuxtSchemaOrg from '../../../src/module'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  modules: [
    NuxtSchemaOrg,
    '@nuxtjs/i18n',
  ],
  schemaOrg: {
    identity: 'Organization',
  },
  site: {
    url: 'https://nuxtseo.com',
  },
  i18n: {
    langDir: './locales',
    baseUrl: 'https://nuxtseo.com',
    detectBrowserLanguage: false,
    defaultLocale: 'en',
    strategy: 'prefix',
    locales: [
      {
        code: 'en',
        language: 'en-US',
        file: 'en',
      },
      {
        code: 'ja',
        language: 'ja',
        file: 'ja',
      },
      {
        code: 'zh',
        language: 'zh',
        file: 'zh',
      },
    ],
  },

  compatibilityDate: '2024-07-22',
})
