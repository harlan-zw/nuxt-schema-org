import { resolve } from 'pathe'
import NuxtSchemaOrg from '../../../src/module'

function r(s: string) {
  return resolve(__dirname, s)
}

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
    langDir: r('./locales'),
    baseUrl: 'https://nuxtseo.com',
    detectBrowserLanguage: false,
    defaultLocale: 'en',
    strategy: 'prefix',
    locales: [
      {
        code: 'en',
        language: 'en-US',
        file: r('./locales/en'),
      },
      {
        code: 'ja',
        language: 'ja',
        file: r('./locales/ja'),
      },
      {
        code: 'zh',
        language: 'zh',
        file: r('./locales/zh'),
      },
    ],
  },

  compatibilityDate: '2024-07-22',
})
