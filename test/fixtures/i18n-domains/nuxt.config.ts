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
    strategy: 'no_prefix',
    differentDomains: true,
    detectBrowserLanguage: false,
    defaultLocale: 'en',
    locales: [
      {
        code: 'en',
        language: 'en-US',
        file: './locales/en',
        domain: 'en.nuxtseo.com',
      },
      {
        code: 'ja',
        language: 'ja',
        file: './locales/ja',
        domain: 'http://jp.nuxtseo.com:3000/',
      },
      {
        code: 'zh',
        language: 'zh',
        file: './locales/zh',
        domain: 'zh.nuxtseo.com',
      },
    ],
  },

  compatibilityDate: '2024-07-22',
})
