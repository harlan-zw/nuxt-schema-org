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
    strategy: 'no_prefix',
    differentDomains: true,
    detectBrowserLanguage: false,
    defaultLocale: 'en',
    locales: [
      {
        code: 'en',
        language: 'en-US',
        domain: 'en.nuxtseo.com',
        file: 'en.ts',
      },
      {
        code: 'ja',
        language: 'ja',
        domain: 'http://jp.nuxtseo.com:3000/',
        file: 'ja.ts',
      },
      {
        code: 'zh',
        language: 'zh',
        domain: 'zh.nuxtseo.com',
        file: 'zh.ts',
      },
    ],
  },

  compatibilityDate: '2024-07-22',
})
